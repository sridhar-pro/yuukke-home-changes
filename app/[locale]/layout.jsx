'use client';

import { NextIntlProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export default function LocaleLayout({ children, params: { locale } }) {
  let messages;

  try {
    messages = require(`../../../public/locales/${locale}/common.json`);
  } catch (error) {
    notFound(); // Show 404 if locale not found
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlProvider locale={locale} messages={messages}>
          {children}
        </NextIntlProvider>
      </body>
    </html>
  );
}
