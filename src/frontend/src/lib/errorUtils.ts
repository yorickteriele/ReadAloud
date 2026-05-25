import { ApiException } from '../modules/identity/api/generated/api-client';

export function getErrorMessage(err: any, fallback: string): string {
  // Handle NSwag ApiException
  if (ApiException.isApiException(err)) {
    try {
      const parsed = JSON.parse(err.response);
      return parsed.message || parsed.title || err.message || fallback;
    } catch {
      return err.message || fallback;
    }
  }

  // Handle Axios error (if any part of the app still uses it)
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  // Handle standard Error
  return err.message || fallback;
}
