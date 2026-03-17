import { prisma } from './database'

export interface AccountNumberVariables {
  branch?: string
  year?: string
  month?: string
  seq?: number
  type?: string
  [key: string]: any
}

export class AccountNumberGenerator {
  /**
   * Generate account number based on template
   */
  static async generateAccountNumber(
    accountType: 'fd' | 'rd' | 'loan',
    templateId?: string,
    variables: AccountNumberVariables = {}
  ): Promise<string> {
    try {
      // Get template (specific or default)
      const template = await this.getTemplate(accountType, templateId)
      if (!template) {
        throw new Error('No numbering template found')
      }

      // Prepare variables
      const resolvedVariables = await this.resolveVariables(template, variables)

      // Generate account number
      const accountNumber = this.processTemplate(template.template, resolvedVariables)

      // Update sequence in template
      await this.updateSequence(template.id)

      return accountNumber
    } catch (error) {
      console.error('Failed to generate account number:', error)
      throw error
    }
  }

  /**
   * Get appropriate template for account type
   */
  private static async getTemplate(
    accountType: string,
    templateId?: string
  ) {
    if (templateId) {
      return await prisma.numberingTemplate.findUnique({
        where: { id: templateId, isActive: true }
      })
    }

    // Find default template for account type
    return await prisma.numberingTemplate.findFirst({
      where: {
        accountType: { in: [accountType, 'all'] },
        isActive: true
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  /**
   * Resolve template variables
   */
  private static async resolveVariables(
    template: any,
    providedVars: AccountNumberVariables
  ): Promise<AccountNumberVariables> {
    const variables: AccountNumberVariables = { ...providedVars }

    // Auto-resolve common variables
    if (!variables.year) {
      variables.year = new Date().getFullYear().toString()
    }

    if (!variables.month) {
      variables.month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    }

    if (!variables.type) {
      variables.type = template.accountType === 'all' ? 'GEN' : template.accountType.toUpperCase()
    }

    // Generate sequence number
    const nextSequence = template.currentSequence + 1
    variables.seq = nextSequence

    return variables
  }

  /**
   * Process template string with variables
   */
  private static processTemplate(template: string, variables: AccountNumberVariables): string {
    let result = template

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}(?::([^}]+))?\\}`, 'g')
      result = result.replace(regex, (match, format) => {
        const strValue = String(value)
        
        if (format) {
          // Handle formatting like {seq:6} for zero-padded 6-digit number
          if (format.match(/^\d+$/)) {
            return strValue.padStart(Number(format), '0')
          }
          // Add more formatting options as needed
        }
        
        return strValue
      })
    })

    return result
  }

  /**
   * Update sequence number in template
   */
  private static async updateSequence(templateId: string) {
    await prisma.numberingTemplate.update({
      where: { id: templateId },
      data: {
        currentSequence: {
          increment: 1
        }
      }
    })
  }

  /**
   * Create default numbering templates
   */
  static async createDefaultTemplates() {
    const templates = [
      {
        name: 'FD Default',
        template: 'FD-{branch}-{year}-{seq:6}',
        description: 'Default Fixed Deposit account numbering',
        accountType: 'fd',
        requiredVariables: ['branch', 'year', 'seq']
      },
      {
        name: 'RD Default',
        template: 'RD-{branch}-{year}-{seq:6}',
        description: 'Default Recurring Deposit account numbering',
        accountType: 'rd',
        requiredVariables: ['branch', 'year', 'seq']
      },
      {
        name: 'Loan Default',
        template: 'LN-{branch}-{year}-{seq:6}',
        description: 'Default Loan account numbering',
        accountType: 'loan',
        requiredVariables: ['branch', 'year', 'seq']
      }
    ]

    for (const template of templates) {
      const existing = await prisma.numberingTemplate.findFirst({
        where: { name: template.name }
      })

      if (!existing) {
        await prisma.numberingTemplate.create({
          data: template
        })
      }
    }
  }

  /**
   * Validate template format
   */
  static validateTemplate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for balanced braces
    const openBraces = (template.match(/\{/g) || []).length
    const closeBraces = (template.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in template')
    }

    // Check for valid variable format
    const invalidVars = template.match(/\{[^}]*\}/g)?.filter(v => {
      const content = v.slice(1, -1)
      return !content.match(/^[a-zA-Z_][a-zA-Z0-9_]*(?::[^}]*)?$/)
    })

    if (invalidVars?.length) {
      errors.push(`Invalid variable format: ${invalidVars.join(', ')}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
