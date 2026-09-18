import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { loadS3Config } from './s3.config.js';

const DEFAULT_URL_EXPIRES_IN_SECONDS = 300;

@Injectable()
export class S3Service implements OnModuleDestroy {
  private readonly logger = new Logger(S3Service.name);
  private readonly config = loadS3Config();
  private readonly client = new S3Client({
    region: this.config.region,
    endpoint: this.config.endpoint,
    forcePathStyle: this.config.forcePathStyle,
    credentials: this.config.credentials,
  });

  onModuleDestroy() {
    this.client.destroy();
  }

  /** Sube un objeto nuevo. Nunca sobrescribe: si la key ya existe lanza ConflictException. */
  async put(key: string, body: Buffer, options: { contentType: string }): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: body,
          ContentType: options.contentType,
          IfNoneMatch: '*',
        }),
      );
    } catch (error) {
      throw this.translate(error, key);
    }
  }

  async getBuffer(key: string): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
      return Buffer.from(await response.Body!.transformToByteArray());
    } catch (error) {
      throw this.translate(error, key);
    }
  }

  /** URL temporal de descarga; el navegador baja el archivo directo de S3 con `fileName` como nombre. */
  async getDownloadUrl(
    key: string,
    options: { fileName: string; expiresIn?: number },
  ): Promise<string> {
    try {
      return await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          ResponseContentDisposition: this.contentDisposition(options.fileName),
        }),
        { expiresIn: options.expiresIn ?? DEFAULT_URL_EXPIRES_IN_SECONDS },
      );
    } catch (error) {
      throw this.translate(error, key);
    }
  }

  /** Solo para compensar un fallo posterior a `put`; no exponer por HTTP (los snapshots son historial). */
  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
    } catch (error) {
      throw this.translate(error, key);
    }
  }

  private contentDisposition(fileName: string): string {
    const asciiFallback = fileName.replace(/[^\x20-\x7E]|["\\]/g, '_');
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }

  private translate(error: unknown, key: string): Error {
    const { name, $metadata } = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (name === 'NoSuchKey' || $metadata?.httpStatusCode === 404) {
      return new NotFoundException(`File not found in storage: ${key}`);
    }
    if (name === 'PreconditionFailed' || $metadata?.httpStatusCode === 412) {
      return new ConflictException(`File already exists in storage: ${key}`);
    }
    this.logger.error(`S3 operation failed for key ${key}`, error instanceof Error ? error.stack : error);
    return new InternalServerErrorException('Storage operation failed');
  }
}
