export function parseCSV(csvText: string): string[][] {
  const result: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < csvText.length) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i += 2
        continue
      }

      inQuotes = !inQuotes
      i++
      continue
    }

    if (!inQuotes) {
      if (char === ',') {
        currentRow.push(currentField)
        currentField = ''
        i++
        continue
      }

      if (char === '\n' || char === '\r') {
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField)
          if (currentRow.some(field => field.trim())) {
            result.push(currentRow)
          }
          currentRow = []
          currentField = ''
        }

        if (char === '\r' && nextChar === '\n') {
          i += 2
        } else {
          i++
        }

        continue
      }
    }

    currentField += char
    i++
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    if (currentRow.some(field => field.trim())) {
      result.push(currentRow)
    }
  }

  return result
}

export function parseCSVToObjects(csvText: string): Record<string, unknown>[] {
  const rows = parseCSV(csvText)

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0].map(header => header.trim())
  const dataRows = rows.slice(1)

  return dataRows.map(row => {
    const obj: Record<string, unknown> = {}
    headers.forEach((header, index) => {
      obj[header] = row[index]?.trim() || ''
    })
    return obj
  })
}
