import { AccountNumberGenerator } from '@/lib/account-generator'

async function initTemplates() {
  try {
    await AccountNumberGenerator.createDefaultTemplates()
    console.log('Default numbering templates created successfully')
  } catch (error) {
    console.error('Failed to create templates:', error)
  }
}

initTemplates()
