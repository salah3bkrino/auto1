# AutomationService - Database Seeder
# This script creates initial data for the AutomationService platform

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting AutomationService database seeding...');

  try {
    // Create plans
    await seedPlans();
    
    // Create demo user
    await seedDemoUser();
    
    // Create demo tenant
    await seedDemoTenant();
    
    console.log('✅ AutomationService database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPlans() {
  console.log('📋 Creating subscription plans for AutomationService...');

  const plans = [
    {
      name: 'Starter Automation',
      description: 'Perfect for small businesses getting started with WhatsApp automation',
      price: 29.00,
      currency: 'USD',
      interval: 'month',
      features: [
        '1,000 conversations/month',
        'Basic automation workflows',
        'Email support',
        '1 WhatsApp number',
        'Basic analytics',
        'Contact management',
        'Message templates',
        'Real-time chat support'
      ],
      limits: {
        messagesPerMonth: 1000,
        contactsPerMonth: 500,
        workflowsPerMonth: 5,
        whatsappNumbers: 1,
        teamMembers: 1,
        apiCallsPerMonth: 1000
      },
      status: 'ACTIVE',
      sortOrder: 1
    },
    {
      name: 'Pro Automation',
      description: 'Ideal for growing businesses with advanced automation needs',
      price: 99.00,
      currency: 'USD',
      interval: 'month',
      features: [
        '5,000 conversations/month',
        'Advanced automation workflows',
        'Priority support',
        '3 WhatsApp numbers',
        'Advanced analytics',
        'Contact management',
        'Message templates',
        'API access',
        'Custom integrations',
        'A/B testing',
        'Campaign management',
        'Real-time analytics'
      ],
      limits: {
        messagesPerMonth: 5000,
        contactsPerMonth: 2000,
        workflowsPerMonth: 20,
        whatsappNumbers: 3,
        teamMembers: 5,
        apiCallsPerMonth: 10000
      },
      status: 'ACTIVE',
      sortOrder: 2
    },
    {
      name: 'Business Automation',
      description: 'Complete solution for large businesses with high volume automation needs',
      price: 299.00,
      currency: 'USD',
      interval: 'month',
      features: [
        '15,000 conversations/month',
        'Custom automation workflows',
        'Phone support',
        '10 WhatsApp numbers',
        'Advanced analytics',
        'Contact management',
        'Message templates',
        'API access',
        'Custom integrations',
        'A/B testing',
        'Campaign management',
        'White-label options',
        'Dedicated account manager',
        'Custom reporting',
        'SLA guarantee',
        'Priority feature requests'
      ],
      limits: {
        messagesPerMonth: 15000,
        contactsPerMonth: 10000,
        workflowsPerMonth: 100,
        whatsappNumbers: 10,
        teamMembers: 20,
        apiCallsPerMonth: 50000
      },
      status: 'ACTIVE',
      sortOrder: 3
    },
    {
      name: 'Enterprise Automation',
      description: 'Tailored solution for enterprise-level automation requirements',
      price: 999.00,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited conversations',
        'Unlimited workflows',
        '24/7 dedicated support',
        'Unlimited WhatsApp numbers',
        'Enterprise analytics',
        'Advanced contact management',
        'Custom message templates',
        'Unlimited API access',
        'Custom integrations',
        'Advanced A/B testing',
        'Multi-channel campaigns',
        'Full white-label',
        'Dedicated account team',
        'Custom reporting',
        'SLA guarantee',
        'Priority feature requests'
      ],
      limits: {
        messagesPerMonth: 999999,
        contactsPerMonth: 999999,
        workflowsPerMonth: 999,
        whatsappNumbers: 999,
        teamMembers: 999,
        apiCallsPerMonth: 999999
      },
      status: 'ACTIVE',
      sortOrder: 4
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    });
  }

  console.log('✅ Subscription plans created for AutomationService');
}

async function seedDemoUser() {
  console.log('👤 Creating demo user for AutomationService...');

  const hashedPassword = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@automationservice.com' },
    update: {
      firstName: 'Demo',
      lastName: 'User',
      password: hashedPassword,
      phone: '+1234567890',
      companyName: 'Demo Automation Company',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: new Date()
    },
    create: {
      email: 'demo@automationservice.com',
      firstName: 'Demo',
      lastName: 'User',
      password: hashedPassword,
      phone: '+1234567890',
      companyName: 'Demo Automation Company',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true
    }
  });

  console.log('✅ Demo user created/updated for AutomationService');
  return demoUser;
}

async function seedDemoTenant() {
  console.log('🏢 Creating demo tenant for AutomationService...');

  // Get demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@automationservice.com' }
  });

  if (!demoUser) {
    throw new Error('Demo user not found');
  }

  // Get Starter plan
  const starterPlan = await prisma.plan.findUnique({
    where: { name: 'Starter Automation' }
  });

  if (!starterPlan) {
    throw new Error('Starter Automation plan not found');
  }

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { ownerId: demoUser.id },
    update: {
      name: 'Demo Automation Workspace',
      subdomain: 'demo',
      primaryColor: '#2563EB', // Professional blue
      status: 'ACTIVE'
    },
    create: {
      name: 'Demo Automation Workspace',
      subdomain: 'demo',
      ownerId: demoUser.id,
      primaryColor: '#2563EB', // Professional blue
      status: 'ACTIVE'
    }
  });

  // Create tenant user relationship
  await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: demoUser.id
      }
    },
    update: {
      role: 'OWNER',
      status: 'ACTIVE'
    },
    create: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      role: 'OWNER',
      status: 'ACTIVE'
    }
  });

  // Create demo subscription
  const subscription = await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {
      planId: starterPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      stripeSubscriptionId: 'sub_demo_starter_' + Date.now(),
      stripeCustomerId: 'cus_demo_' + Date.now()
    },
    create: {
      userId: demoUser.id,
      planId: starterPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      stripeSubscriptionId: 'sub_demo_starter_' + Date.now(),
      stripeCustomerId: 'cus_demo_' + Date.now()
    }
  });

  // Create demo WhatsApp account
  const demoWhatsApp = await prisma.whatsAppAccount.create({
    data: {
      tenantId: demoTenant.id,
      phoneNumber: '+1234567890',
      phoneNumberId: 'phone_demo_' + Date.now(),
      displayName: 'Demo WhatsApp Number',
      businessId: 'biz_demo_' + Date.now(),
      wabaId: 'waba_demo_' + Date.now(),
      accessToken: 'demo_access_token_' + Date.now(),
      verifyToken: 'demo_verify_token_' + Date.now(),
      webhookSecret: 'demo_webhook_secret_' + Date.now(),
      status: 'ACTIVE',
      metadata: {
        isDemo: true,
        connectedAt: new Date().toISOString()
      }
    }
  });

  // Create demo contacts
  const demoContacts = [
    {
      whatsappId: '+1987654321',
      name: 'John Doe',
      email: 'john@automationservice.com',
      phone: '+1987654321',
      tags: ['customer', 'vip', 'automation_user'],
      status: 'ACTIVE'
    },
    {
      whatsappId: '+1976543210',
      name: 'Jane Smith',
      email: 'jane@automationservice.com',
      phone: '+1976543210',
      tags: ['lead', 'prospect'],
      status: 'ACTIVE'
    },
    {
      whatsappId: '+1965432109',
      name: 'Mike Johnson',
      email: 'mike@automationservice.com',
      phone: '+1965432109',
      tags: ['prospect', 'interested'],
      status: 'ACTIVE'
    }
  ];

  for (const contactData of demoContacts) {
    await prisma.contact.upsert({
      where: {
        tenantId_whatsappId: {
          tenantId: demoTenant.id,
          whatsappId: contactData.whatsappId
        }
      },
      update: contactData,
      create: {
        ...contactData,
        tenantId: demoTenant.id
      }
    });
  }

  // Create demo workflows
  const demoWorkflows = [
    {
      name: 'Welcome Automation',
      description: 'Send a welcome message to new contacts automatically',
      trigger: 'MESSAGE_RECEIVED',
      nodes: [
        {
          id: 'trigger_1',
          type: 'trigger',
          position: { x: 100, y: 100 },
          data: {
            label: 'New Message',
            type: 'trigger',
            config: {
              triggerType: 'message_received',
              keywords: []
            }
          }
        },
        {
          id: 'message_1',
          type: 'message',
          position: { x: 300, y: 100 },
          data: {
            label: 'Send Welcome',
            type: 'message',
            config: {
              message: '👋 Welcome to AutomationService! We\'re excited to help you streamline your WhatsApp communication. How can we assist you today?',
              messageType: 'text'
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge_1',
          source: 'trigger_1',
          target: 'message_1'
        }
      ],
      status: 'ACTIVE'
    },
    {
      name: 'Customer Support Automation',
      description: 'Handle customer support inquiries automatically',
      trigger: 'KEYWORD',
      nodes: [
        {
          id: 'trigger_2',
          type: 'trigger',
          position: { x: 100, y: 100 },
          data: {
            label: 'Support Keyword',
            type: 'trigger',
            config: {
              triggerType: 'keyword',
              keywords: ['support', 'help', 'assistance', 'automation']
            }
          }
        },
        {
          id: 'condition_1',
          type: 'condition',
          position: { x: 300, y: 100 },
          data: {
            label: 'Check Urgency',
            type: 'condition',
            config: {
              condition: 'contains',
              value: 'urgent'
            }
          }
        },
        {
          id: 'message_2',
          type: 'message',
          position: { x: 500, y: 50 },
          data: {
            label: 'Urgent Response',
            type: 'message',
            config: {
              message: '🚨 We understand this is urgent. Our support team will respond within 1 hour.',
              messageType: 'text'
            }
          }
        },
        {
          id: 'message_3',
          type: 'message',
          position: { x: 500, y: 150 },
          data: {
            label: 'Standard Response',
            type: 'message',
            config: {
              message: '📞 Thank you for contacting AutomationService. We\'ll respond within 24 hours.',
              messageType: 'text'
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge_2',
          source: 'trigger_2',
          target: 'condition_1'
        },
        {
          id: 'edge_3',
          source: 'condition_1',
          target: 'message_2'
        },
        {
          id: 'edge_4',
          source: 'condition_1',
          target: 'message_3'
        }
      ],
      status: 'ACTIVE'
    },
    {
      name: 'Lead Qualification',
      description: 'Automatically qualify leads based on their responses',
      trigger: 'KEYWORD',
      nodes: [
        {
          id: 'trigger_3',
          type: 'trigger',
          position: { x: 100, y: 100 },
          data: {
            label: 'Lead Keywords',
            type: 'trigger',
            config: {
              triggerType: 'keyword',
              keywords: ['price', 'cost', 'demo', 'trial', 'information']
            }
          }
        },
        {
          id: 'condition_2',
          type: 'condition',
          position: { x: 300, y: 100 },
          data: {
            label: 'Lead Score',
            type: 'condition',
            config: {
              condition: 'contains',
              value: 'interested'
            }
          }
        },
        {
          id: 'tag_1',
          type: 'tag',
          position: { x: 500, y: 50 },
          data: {
            label: 'Add "Hot Lead" tag',
            type: 'tag',
            config: {
              tag: 'hot_lead',
              action: 'add'
            }
          }
        },
        {
          id: 'message_4',
          type: 'message',
          position: { x: 500, y: 150 },
          data: {
            label: 'Hot Lead Response',
            type: 'message',
            config: {
              message: '🔥 Thanks for your interest! Our sales team will contact you within 2 business hours.',
              messageType: 'text'
            }
          }
        },
        {
          id: 'message_5',
          type: 'message',
          position: { x: 500, y: 250 },
          data: {
            label: 'Standard Lead Response',
            type: 'message',
            config: {
              message: 'Thank you for your interest. We\'ll get back to you soon.',
              messageType: 'text'
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge_2',
          source: 'trigger_3',
          target: 'condition_2'
        },
        {
          id: 'edge_3',
          source: 'condition_2',
          target: 'tag_1'
        },
        {
          id: 'edge_4',
          source: 'tag_1',
          target: 'message_4'
        },
        {
          id: 'edge_5',
          source: 'condition_2',
          target: 'message_5'
        }
      ],
      status: 'ACTIVE'
    }
  ];

  for (const workflowData of demoWorkflows) {
    await prisma.workflow.create({
      data: {
        ...workflowData,
        tenantId: demoTenant.id,
        isActive: true,
        version: 1
      }
    });
  }

  // Create demo message templates
  const demoTemplates = [
    {
      name: 'Welcome to AutomationService',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'body',
          text: 'Welcome to {{company_name}}! We\'re excited to have you here. How can we assist you today with your automation needs?'
        }
      ],
      status: 'APPROVED'
    },
    {
      name: 'Order Confirmation',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'body',
          text: 'Thank you for your order {{order_number}}! Your items are being prepared and will be shipped soon. Track your order here: {{tracking_url}}'
        }
      ],
      status: 'APPROVED'
    },
    {
      name: 'Appointment Reminder',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'body',
          text: 'Reminder: You have an appointment with {{business_name}} on {{appointment_date}} at {{appointment_time}}. Reply CONFIRM to confirm or CANCEL to reschedule.'
        }
      ],
      status: 'APPROVED'
    },
    {
      name: 'Support Ticket Confirmation',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'body',
          text: 'Your support ticket #{{ticket_number}} has been received. Our team will respond within {{response_time}} hours.'
        }
      ],
      status: 'APPROVED'
    }
  ];

  for (const templateData of demoTemplates) {
    await prisma.messageTemplate.create({
      data: {
        ...templateData,
        tenantId: demoTenant.id,
        whatsappAccountId: demoWhatsApp.id
      }
    });
  }

  console.log('✅ Demo tenant and sample data created for AutomationService');
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };