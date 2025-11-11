/**
 * Friday AI Lead Intelligence System
 * Main Entry Point
 */

import { FridayAIService } from './services/FridayAIService';
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Friday AI Service
const fridayAI = new FridayAIService(process.env.CHROMADB_URL || 'http://localhost:8000');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Friday AI Lead Intelligence',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Customer lookup endpoint
app.post('/api/customer', async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Customer identifier required (email, phone, or name)'
      });
    }
    
    const result = await fridayAI.getCustomerContext(identifier);
    res.json(result);
  } catch (error) {
    console.error('Customer lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Booking prediction endpoint
app.post('/api/predict-booking', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID required'
      });
    }
    
    const prediction = await fridayAI.predictNextBooking(customerId);
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Booking prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Revenue opportunities endpoint
app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await fridayAI.findRevenueOpportunities();
    
    res.json({
      success: true,
      data: {
        opportunities,
        totalValue: opportunities.reduce((sum, opp) => sum + opp.potential, 0),
        count: opportunities.length
      }
    });
  } catch (error) {
    console.error('Revenue opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Natural language query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query text required'
      });
    }
    
    const result = await fridayAI.handleQuery(query);
    res.json(result);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Daily analysis endpoint
app.get('/api/daily-analysis', async (req, res) => {
  try {
    const opportunities = await fridayAI.findRevenueOpportunities();
    
    // TODO: Implement full daily analysis
    res.json({
      success: true,
      data: {
        date: new Date(),
        opportunities: opportunities.slice(0, 10), // Top 10
        totalOpportunityValue: opportunities.reduce((sum, opp) => sum + opp.potential, 0),
        recommendedActions: opportunities.slice(0, 5).map(opp => ({
          customer: opp.customerName,
          action: opp.suggestion,
          value: opp.potential
        }))
      }
    });
  } catch (error) {
    console.error('Daily analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Initialize service and start server
async function start() {
  try {
    console.log('🚀 Starting Friday AI Lead Intelligence System...');
    
    // Initialize Friday AI
    await fridayAI.initialize();
    
    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`✅ Friday AI Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API endpoints:`);
      console.log(`   POST /api/customer - Customer lookup`);
      console.log(`   POST /api/predict-booking - Booking prediction`);
      console.log(`   GET  /api/opportunities - Revenue opportunities`);
      console.log(`   POST /api/query - Natural language query`);
      console.log(`   GET  /api/daily-analysis - Daily analysis`);
    });
  } catch (error) {
    console.error('❌ Failed to start Friday AI Service:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('📴 Shutting down Friday AI Service...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down Friday AI Service...');
  process.exit(0);
});

// Start the service
start();
