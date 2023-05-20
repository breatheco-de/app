import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="notranslate" translate="no">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
