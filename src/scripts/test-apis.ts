#!/usr/bin/env tsx

/**
 * API Testing Script
 * Tests all API endpoints to ensure they're working correctly
 */

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  endpoint: string
  method: string
  status: 'pass' | 'fail' | 'skip'
  message: string
  responseTime?: number
}

class APITester {
  private results: TestResult[] = []

  async makeRequest(endpoint: string, method: string = 'GET', data?: any, headers?: Record<string, string>): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data)
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, config)
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          endpoint,
          method,
          status: 'pass',
          message: `Success (${response.status})`,
          responseTime
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return {
          endpoint,
          method,
          status: 'fail',
          message: `Failed (${response.status}): ${errorData.error || 'Unknown error'}`,
          responseTime
        }
      }
    } catch (error) {
      return {
        endpoint,
        method,
        status: 'fail',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: Date.now() - startTime
      }
    }
  }

  async testAuthEndpoints(): Promise<void> {
    console.log('\n🔐 Testing Authentication Endpoints...')
    
    // Test login
    const loginResult = await this.makeRequest('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'testpassword'
    })
    this.results.push(loginResult)
    
    // Test signup
    const signupResult = await this.makeRequest('/api/auth/signup', 'POST', {
      email: 'newuser@example.com',
      password: 'newpassword',
      firstName: 'Test',
      lastName: 'User'
    })
    this.results.push(signupResult)
    
    console.log('✅ Auth endpoints tested')
  }

  async testCustomerEndpoints(): Promise<void> {
    console.log('\n👥 Testing Customer Endpoints...')
    
    // Test GET customers
    const customersResult = await this.makeRequest('/api/customers')
    this.results.push(customersResult)
    
    // Test GET customer ledger
    const ledgerResult = await this.makeRequest('/api/customers/mock-customer-id/ledger')
    this.results.push(ledgerResult)
    
    console.log('✅ Customer endpoints tested')
  }

  async testAccountEndpoints(): Promise<void> {
    console.log('\n🏦 Testing Account Endpoints...')
    
    // Test GET accounts
    const accountsResult = await this.makeRequest('/api/accounts')
    this.results.push(accountsResult)
    
    // Test POST account
    const createAccountResult = await this.makeRequest('/api/accounts', 'POST', {
      customerId: 'mock-customer-id',
      accountType: 'fd',
      principalAmount: 5000,
      interestRate: 7.5,
      tenure: 12,
      startDate: new Date().toISOString().split('T')[0]
    })
    this.results.push(createAccountResult)
    
    // Test GET account by ID
    const accountResult = await this.makeRequest('/api/accounts/mock-account-id')
    this.results.push(accountResult)
    
    console.log('✅ Account endpoints tested')
  }

  async testTransactionEndpoints(): Promise<void> {
    console.log('\n💸 Testing Transaction Endpoints...')
    
    // Test GET transactions
    const transactionsResult = await this.makeRequest('/api/transactions')
    this.results.push(transactionsResult)
    
    // Test POST transaction
    const createTransactionResult = await this.makeRequest('/api/transactions', 'POST', {
      accountId: 'mock-account-id',
      type: 'deposit',
      amount: 1000,
      description: 'Test deposit'
    })
    this.results.push(createTransactionResult)
    
    // Test PATCH transactions (bulk update)
    const updateTransactionResult = await this.makeRequest('/api/transactions', 'PATCH', {
      ids: ['mock-id-1', 'mock-id-2'],
      updates: { description: 'Updated description' }
    })
    this.results.push(updateTransactionResult)
    
    console.log('✅ Transaction endpoints tested')
  }

  async testSuggestionEndpoints(): Promise<void> {
    console.log('\n💡 Testing Suggestion Endpoints...')
    
    // Test GET suggestions
    const suggestionsResult = await this.makeRequest('/api/suggestions')
    this.results.push(suggestionsResult)
    
    // Test POST suggestion
    const createSuggestionResult = await this.makeRequest('/api/suggestions', 'POST', {
      customerId: 'mock-customer-id',
      accountId: 'mock-account-id',
      type: 'MATURITY',
      title: 'Test Suggestion',
      description: 'Test suggestion description',
      amount: 5000
    })
    this.results.push(createSuggestionResult)
    
    // Test POST approve suggestions
    const approveResult = await this.makeRequest('/api/suggestions/approve', 'POST', {
      ids: ['mock-suggestion-id-1', 'mock-suggestion-id-2']
    })
    this.results.push(approveResult)
    
    // Test POST reject suggestion
    const rejectResult = await this.makeRequest('/api/suggestions/mock-suggestion-id/reject', 'POST', {
      reason: 'Test rejection reason'
    })
    this.results.push(rejectResult)
    
    console.log('✅ Suggestion endpoints tested')
  }

  async testUserEndpoints(): Promise<void> {
    console.log('\n👤 Testing User Management Endpoints...')
    
    // Note: These endpoints require authentication
    const testToken = 'mock-test-token'
    
    // Test GET users
    const usersResult = await this.makeRequest('/api/auth/users', 'GET', undefined, {
      'Authorization': `Bearer ${testToken}`
    })
    this.results.push(usersResult)
    
    // Test POST user
    const createUserResult = await this.makeRequest('/api/auth/users', 'POST', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpassword',
      role: 'operator'
    }, {
      'Authorization': `Bearer ${testToken}`
    })
    this.results.push(createUserResult)
    
    // Test PATCH user
    const updateUserResult = await this.makeRequest('/api/auth/users/mock-user-id', 'PATCH', {
      isActive: false
    }, {
      'Authorization': `Bearer ${testToken}`
    })
    this.results.push(updateUserResult)
    
    // Test DELETE user
    const deleteUserResult = await this.makeRequest('/api/auth/users/mock-user-id', 'DELETE', undefined, {
      'Authorization': `Bearer ${testToken}`
    })
    this.results.push(deleteUserResult)
    
    console.log('✅ User management endpoints tested')
  }

  async testNumberingTemplateEndpoints(): Promise<void> {
    console.log('\n🔢 Testing Numbering Template Endpoints...')
    
    // Test GET numbering templates
    const templatesResult = await this.makeRequest('/api/numbering-templates')
    this.results.push(templatesResult)
    
    // Test POST numbering template
    const createTemplateResult = await this.makeRequest('/api/numbering-templates', 'POST', {
      name: 'Test Template',
      prefix: 'TEST',
      accountType: 'fd',
      format: '{{prefix}}{{sequence}}',
      sequence: 1,
      sequenceLength: 6,
      isActive: true
    })
    this.results.push(createTemplateResult)
    
    // Test PUT numbering template
    const updateTemplateResult = await this.makeRequest('/api/numbering-templates/mock-template-id', 'PUT', {
      name: 'Updated Template',
      prefix: 'UPD',
      accountType: 'rd',
      format: '{{prefix}}{{sequence}}',
      sequence: 10,
      sequenceLength: 6,
      isActive: false
    })
    this.results.push(updateTemplateResult)
    
    // Test DELETE numbering template
    const deleteTemplateResult = await this.makeRequest('/api/numbering-templates/mock-template-id', 'DELETE')
    this.results.push(deleteTemplateResult)
    
    console.log('✅ Numbering template endpoints tested')
  }

  printResults(): void {
    console.log('\n📊 API Test Results Summary')
    console.log('=' .repeat(60))
    
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const skipped = this.results.filter(r => r.status === 'skip').length
    
    console.log(`Total Tests: ${this.results.length}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏭️ Skipped: ${skipped}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(`  ${result.method} ${result.endpoint}`)
          console.log(`    ${result.message}`)
          if (result.responseTime) {
            console.log(`    Response Time: ${result.responseTime}ms`)
          }
        })
    }
    
    if (passed > 0) {
      console.log('\n✅ Passed Tests:')
      this.results
        .filter(r => r.status === 'pass')
        .forEach(result => {
          console.log(`  ${result.method} ${result.endpoint}`)
          console.log(`    ${result.message}`)
          if (result.responseTime) {
            console.log(`    Response Time: ${result.responseTime}ms`)
          }
        })
    }
    
    // Performance summary
    const responseTimes = this.results
      .filter(r => r.responseTime)
      .map(r => r.responseTime!)
    
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const minResponseTime = Math.min(...responseTimes)
      
      console.log('\n⚡ Performance Summary:')
      console.log(`  Average Response Time: ${avgResponseTime.toFixed(2)}ms`)
      console.log(`  Min Response Time: ${minResponseTime}ms`)
      console.log(`  Max Response Time: ${maxResponseTime}ms`)
    }
    
    console.log('\n' + '=' .repeat(60))
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Integration Tests...')
    console.log(`Base URL: ${BASE_URL}`)
    console.log('Testing all endpoints for proper integration and functionality\n')
    
    await this.testAuthEndpoints()
    await this.testCustomerEndpoints()
    await this.testAccountEndpoints()
    await this.testTransactionEndpoints()
    await this.testSuggestionEndpoints()
    await this.testUserEndpoints()
    await this.testNumberingTemplateEndpoints()
    
    this.printResults()
  }
}

// Main execution
async function main() {
  const tester = new APITester()
  await tester.runAllTests()
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { APITester }
