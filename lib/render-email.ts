import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

export function renderEmail(Component: React.ReactElement): string {
  return "<!DOCTYPE html>" + ReactDOMServer.renderToStaticMarkup(Component);
}
