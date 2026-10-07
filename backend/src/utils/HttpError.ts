/** Lỗi nghiệp vụ có kèm HTTP status – errorHandler sẽ trả về đúng mã này cho client. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
