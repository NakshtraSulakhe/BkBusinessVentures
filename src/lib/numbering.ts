import { prisma } from "@/lib/database"
import { AccountNumberGenerator } from "./account-generator"

export async function generateFormattedNumber(templateName: string): Promise<string> {
  const template = await prisma.numberingTemplate.findFirst({
    where: { name: templateName }
  })

  if (!template) {
    // If not found, try to create or find by accountType 'all'
    const fallback = await prisma.numberingTemplate.findFirst({
      where: { accountType: 'all' }
    })
    
    if (!fallback) {
      throw new Error(`Numbering template "${templateName}" not found and no fallback configured`)
    }
    
    return await AccountNumberGenerator.generateAccountNumber(
      'all' as any,
      fallback.id,
      { branch: 'MAIN' }
    )
  }

  return await AccountNumberGenerator.generateAccountNumber(
    template.accountType as any,
    template.id,
    { branch: 'MAIN' }
  )
}

export async function previewNextNumber(templateName: string): Promise<string> {
  const template = await prisma.numberingTemplate.findFirst({
    where: { name: templateName }
  })

  if (!template) return 'TEMPLATE-NOT-FOUND'

  // Using simple preview logic similar to AccountNumberGenerator
  const nextSequence = template.currentSequence + 1
  const vars = {
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    seq: nextSequence,
    branch: 'MAIN'
  }

  // Use the internal processTemplate logic (mocked here or exported from AccountNumberGenerator)
  let result = template.template
  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}(?::([^}]+))?\\}`, 'g')
    result = result.replace(regex, (match, format) => {
      const strValue = String(value)
      if (format && format.match(/^\d+$/)) {
        return strValue.padStart(Number(format), '0')
      }
      return strValue
    })
  })

  return result
}
