declare global {
  namespace Deno {
    const env: {
      get(key: string): string | undefined;
    };
  }
}

export {};