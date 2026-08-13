import * as React from 'react';
import { render } from '@react-email/render';

export async function renderEmail(Component: React.ReactElement): Promise<string> {
  return await render(Component);
}
