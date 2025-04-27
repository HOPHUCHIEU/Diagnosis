import 'jspdf'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number
      head?: string[][]
      body: string[][]
      theme?: string
      margin?: { top: number; right: number; bottom: number; left: number }
      styles?: object
      headStyles?: object
      bodyStyles?: object
      [key: string]: any
    }) => jsPDF
  }
}
