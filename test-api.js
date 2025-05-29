const fetch = require('node-fetch')

async function testAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 Testing API endpoints...\n')
  
  // Test Categories API
  try {
    console.log('Testing GET /api/categories...')
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`)
    console.log(`Status: ${categoriesResponse.status}`)
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json()
      console.log(`✅ Categories: Found ${categories.length} items`)
      console.log(`Sample: ${categories.map(c => c.name).join(', ')}`)
    } else {
      const error = await categoriesResponse.text()
      console.log(`❌ Categories Error: ${error}`)
    }
  } catch (error) {
    console.log(`❌ Categories Request Failed: ${error.message}`)
  }
  
  console.log('')
  
  // Test Subcategories API
  try {
    console.log('Testing GET /api/subcategories...')
    const subcategoriesResponse = await fetch(`${baseUrl}/api/subcategories`)
    console.log(`Status: ${subcategoriesResponse.status}`)
    
    if (subcategoriesResponse.ok) {
      const subcategories = await subcategoriesResponse.json()
      console.log(`✅ Subcategories: Found ${subcategories.length} items`)
      console.log(`Sample: ${subcategories.map(s => s.name).join(', ')}`)
    } else {
      const error = await subcategoriesResponse.text()
      console.log(`❌ Subcategories Error: ${error}`)
    }
  } catch (error) {
    console.log(`❌ Subcategories Request Failed: ${error.message}`)
  }
  
  console.log('')
  
  // Test Products API
  try {
    console.log('Testing GET /api/products...')
    const productsResponse = await fetch(`${baseUrl}/api/products`)
    console.log(`Status: ${productsResponse.status}`)
    
    if (productsResponse.ok) {
      const products = await productsResponse.json()
      console.log(`✅ Products: Found ${products.length} items`)
      console.log(`Sample: ${products.map(p => p.name).join(', ')}`)
    } else {
      const error = await productsResponse.text()
      console.log(`❌ Products Error: ${error}`)
    }
  } catch (error) {
    console.log(`❌ Products Request Failed: ${error.message}`)
  }
  
  console.log('\n🏁 API testing complete!')
}

// Run the test