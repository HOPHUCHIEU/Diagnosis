import { ThemeProvider } from 'styled-components'
import React from 'react'

export function ThemeProviders({ children }: React.PropsWithChildren) {
  return <ThemeProvider theme={{ antd: {}, base: { color: 'mediumseagreen' } }}>{children}</ThemeProvider>
}
