const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test data...');

  // 1. Clean existing records
  await prisma.followUp.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create default user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'seed@example.com',
      passwordHash,
      name: 'Sarah Jenkins',
      companyName: 'Jenkins Digital Studio',
      currency: 'USD',
      timeZone: 'EST',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
    },
  });
  console.log(`Created default user: ${user.email} (Password: password123)`);

  // 3. Create Clients
  const clientAcme = await prisma.client.create({
    data: {
      name: 'Sarah Connor',
      email: 'sconnor@acme.com',
      phone: '+1 (555) 019-2834',
      company: 'Acme Corporation',
      status: 'Active',
      notes: 'Main corporate client. Prefers email updates over phone calls.',
      userId: user.id,
    },
  });

  const clientGlobex = await prisma.client.create({
    data: {
      name: 'Hank Scorpio',
      email: 'hscorpio@globex.com',
      phone: '+1 (555) 901-2983',
      company: 'Globex Inc',
      status: 'Active',
      notes: 'Database optimization client. Extremely tech-savvy.',
      userId: user.id,
    },
  });

  const clientStark = await prisma.client.create({
    data: {
      name: 'Pepper Potts',
      email: 'ppotts@stark.com',
      phone: '+1 (555) Stark-01',
      company: 'Stark Industries',
      status: 'Lead',
      notes: 'Potential large-scale client for internal UI dashboards.',
      userId: user.id,
    },
  });

  console.log('Created 3 Clients.');

  // 4. Create Projects
  const now = new Date();
  const projectAcme = await prisma.project.create({
    data: {
      name: 'Acme E-Commerce Redesign',
      description: 'Full redesign of client-facing online checkout experience and backend Stripe hook integrations.',
      status: 'In Progress',
      budget: 15000.0,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      plannedEndDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
      clientId: clientAcme.id,
      userId: user.id,
    },
  });

  const projectGlobex = await prisma.project.create({
    data: {
      name: 'Postgres Scale Review',
      description: 'Inspect partition indexing, analyze queries latency issues, and draft tuning recommendations.',
      status: 'Review',
      budget: 6500.0,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      plannedEndDate: new Date(now.getFullYear(), now.getMonth(), 30),
      clientId: clientGlobex.id,
      userId: user.id,
    },
  });

  const projectStark = await prisma.project.create({
    data: {
      name: 'Arc Interface Console',
      description: 'Design mockups and UI layout frames for heavy machinery diagnostics panel.',
      status: 'Planning',
      budget: 25000.0,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      plannedEndDate: new Date(now.getFullYear(), now.getMonth() + 4, 15),
      clientId: clientStark.id,
      userId: user.id,
    },
  });

  console.log('Created 3 Projects.');

  // 5. Create Invoices
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      status: 'Paid',
      issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      itemsJson: JSON.stringify([
        { description: 'Initial Discovery & Mockups', quantity: 1, rate: 5000.0 },
      ]),
      totalAmount: 5000.0,
      outstandingAmount: 0.0,
      clientId: clientAcme.id,
      userId: user.id,
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0002',
      status: 'Sent',
      issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
      dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
      itemsJson: JSON.stringify([
        { description: 'Development Milestones 1 & 2', quantity: 1, rate: 5000.0 },
      ]),
      totalAmount: 5000.0,
      outstandingAmount: 5000.0,
      clientId: clientAcme.id,
      userId: user.id,
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0003',
      status: 'Paid',
      issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 30),
      itemsJson: JSON.stringify([
        { description: 'DB Audit Consulting Hours', quantity: 40, rate: 150.0 },
        { description: 'Report Drafting Fee', quantity: 1, rate: 500.0 },
      ]),
      totalAmount: 6500.0,
      outstandingAmount: 0.0,
      clientId: clientGlobex.id,
      userId: user.id,
    },
  });

  console.log('Created 3 Invoices.');

  // 6. Create Sales Leads
  await prisma.lead.create({
    data: {
      title: 'Mobile App Project Opportunity',
      contactName: 'Peter Parker',
      email: 'pparker@dailybugle.com',
      phone: '+1 (555) Spidey-99',
      company: 'The Daily Bugle',
      status: 'Proposal Sent',
      pipelineValue: 12000.0,
      notes: 'Sent contract proposal draft. Parker wants high-speed photo upload capabilities.',
      userId: user.id,
    },
  });

  await prisma.lead.create({
    data: {
      title: 'CMS Template Development',
      contactName: 'Bruce Wayne',
      email: 'bwayne@wayne.com',
      phone: '+1 (555) Bat-Call',
      company: 'Wayne Enterprises',
      status: 'Negotiating',
      pipelineValue: 18500.0,
      notes: 'Meeting next Tuesday to coordinate requirements constraints.',
      userId: user.id,
    },
  });

  await prisma.lead.create({
    data: {
      title: 'SEO Audit Request',
      contactName: 'Diana Prince',
      email: 'dprince@museum.org',
      company: 'Louvre Historical Studies',
      status: 'Prospect',
      pipelineValue: 4500.0,
      notes: 'Initial contact via contact page form. Auditing local discoverability.',
      userId: user.id,
    },
  });

  console.log('Created 3 Leads.');

  // 7. Create Follow-Ups
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.followUp.create({
    data: {
      title: 'Review E-Commerce mockups with Acme',
      type: 'Meeting',
      dueDate: now, // Due Today
      status: 'Pending',
      notes: 'Coordinating checkout flow screens. Share screens on Figma.',
      clientId: clientAcme.id,
      userId: user.id,
    },
  });

  await prisma.followUp.create({
    data: {
      title: 'Email database tuning sign-off reminder',
      type: 'Email',
      dueDate: tomorrow, // Due tomorrow
      status: 'Pending',
      notes: 'Requesting final approval signature on Scorpio recommendations.',
      clientId: clientGlobex.id,
      userId: user.id,
    },
  });

  await prisma.followUp.create({
    data: {
      title: 'Call Pepper Potts to pitch Diagnostic Console UI',
      type: 'Call',
      dueDate: nextWeek, // Due next week
      status: 'Pending',
      notes: 'Initial introduction call. Focus on reliability and dark-theme requirements.',
      clientId: clientStark.id,
      userId: user.id,
    },
  });

  console.log('Created 3 Follow-Up reminders.');
  console.log('Database Seeding Successful!');
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
