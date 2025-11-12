import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationToken.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.file.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Staff/Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@obra360.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: UserRole.STAFF,
      phone: '+34 600 000 001',
    },
  });

  // 2. Staff - Project Manager
  const projectManager = await prisma.user.create({
    data: {
      email: 'pm@obra360.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Manager',
      role: UserRole.STAFF,
      phone: '+34 600 000 002',
    },
  });

  // 3. Cliente 1
  const customer1 = await prisma.user.create({
    data: {
      email: 'cliente1@example.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      role: UserRole.CUSTOMER,
      phone: '+34 600 000 003',
    },
  });

  // 4. Cliente 2
  const customer2 = await prisma.user.create({
    data: {
      email: 'cliente2@example.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.CUSTOMER,
      phone: '+34 600 000 004',
    },
  });

  // 5. Contractor 1 - Arquitecto
  const contractor1 = await prisma.user.create({
    data: {
      email: 'arquitecto@example.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Arquitecta',
      role: UserRole.CONTRACTOR,
      phone: '+34 600 000 005',
    },
  });

  // 6. Contractor 2 - Ingeniero
  const contractor2 = await prisma.user.create({
    data: {
      email: 'ingeniero@example.com',
      password: hashedPassword,
      firstName: 'Pedro',
      lastName: 'Ingeniero',
      role: UserRole.CONTRACTOR,
      phone: '+34 600 000 006',
    },
  });

  console.log('✅ Usuarios creados');

  // Crear proyectos
  const project1 = await prisma.project.create({
    data: {
      name: 'Construcción Edificio Centro',
      description: 'Proyecto de construcción de edificio de oficinas en el centro de la ciudad',
      status: ProjectStatus.ACTIVE,
      customerId: customer1.id,
      createdById: admin.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 500000,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Reforma de Vivienda',
      description: 'Reforma integral de vivienda unifamiliar',
      status: ProjectStatus.ACTIVE,
      customerId: customer2.id,
      createdById: projectManager.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-30'),
      budget: 80000,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Complejo Residencial',
      description: 'Construcción de complejo residencial con 50 viviendas',
      status: ProjectStatus.DRAFT,
      customerId: customer1.id,
      createdById: admin.id,
      budget: 3000000,
    },
  });

  console.log('✅ Proyectos creados');

  // Asignar contractors a proyectos
  await prisma.projectAssignment.createMany({
    data: [
      {
        projectId: project1.id,
        userId: contractor1.id,
        role: 'Arquitecto Principal',
      },
      {
        projectId: project1.id,
        userId: contractor2.id,
        role: 'Ingeniero Estructural',
      },
      {
        projectId: project2.id,
        userId: contractor1.id,
        role: 'Arquitecto',
      },
    ],
  });

  console.log('✅ Asignaciones de proyecto creadas');

  // Crear tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Diseño arquitectónico',
        description: 'Elaborar planos arquitectónicos del edificio',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assignedToId: contractor1.id,
        createdById: admin.id,
        dueDate: new Date('2024-03-31'),
      },
      {
        title: 'Cálculo estructural',
        description: 'Realizar cálculos de estructura del edificio',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assignedToId: contractor2.id,
        createdById: admin.id,
        dueDate: new Date('2024-04-30'),
      },
      {
        title: 'Obtener permisos',
        description: 'Gestionar permisos de obra con el ayuntamiento',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        projectId: project1.id,
        createdById: admin.id,
        dueDate: new Date('2024-02-28'),
      },
      {
        title: 'Demolición',
        description: 'Demoler paredes interiores',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        projectId: project2.id,
        assignedToId: contractor1.id,
        createdById: projectManager.id,
      },
      {
        title: 'Instalación eléctrica',
        description: 'Nueva instalación eléctrica completa',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        projectId: project2.id,
        createdById: projectManager.id,
        dueDate: new Date('2024-04-15'),
      },
    ],
  });

  console.log('✅ Tareas creadas');

  // Crear discussions
  const discussion1 = await prisma.discussion.create({
    data: {
      message: '¿Cuándo empezaremos con la fase de cimentación?',
      projectId: project1.id,
      userId: customer1.id,
    },
  });

  await prisma.discussion.create({
    data: {
      message: 'Estimamos comenzar en 2 semanas una vez tengamos los permisos.',
      projectId: project1.id,
      userId: admin.id,
      parentId: discussion1.id,
    },
  });

  await prisma.discussion.create({
    data: {
      message: 'Los planos arquitectónicos están al 70%. Adjunto versión preliminar.',
      projectId: project1.id,
      userId: contractor1.id,
    },
  });

  console.log('✅ Discusiones creadas');

  // Crear invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      status: 'SENT',
      projectId: project1.id,
      customerId: customer1.id,
      createdById: admin.id,
      subtotal: 100000,
      tax: 21000,
      total: 121000,
      dueDate: new Date('2024-02-15'),
      notes: 'Pago primer trimestre - Fase de diseño',
      items: {
        create: [
          {
            description: 'Diseño arquitectónico',
            quantity: 1,
            unitPrice: 60000,
            total: 60000,
          },
          {
            description: 'Cálculo estructural',
            quantity: 1,
            unitPrice: 40000,
            total: 40000,
          },
        ],
      },
    },
  });

  console.log('✅ Facturas creadas');

  // Crear proposals
  await prisma.proposal.create({
    data: {
      proposalNumber: 'PROP-2024-001',
      title: 'Propuesta Construcción Edificio Centro',
      status: 'ACCEPTED',
      projectId: project1.id,
      customerId: customer1.id,
      createdById: admin.id,
      content: `
        <h2>Propuesta de Construcción</h2>
        <p>Edificio de oficinas de 5 plantas con sótano de parking.</p>
        <h3>Alcance del proyecto:</h3>
        <ul>
          <li>Diseño arquitectónico completo</li>
          <li>Cálculo estructural</li>
          <li>Gestión de permisos</li>
          <li>Construcción llave en mano</li>
        </ul>
      `,
      total: 500000,
      validUntil: new Date('2024-12-31'),
      acceptedAt: new Date('2024-01-15'),
    },
  });

  console.log('✅ Propuestas creadas');

  // Crear notificaciones
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        type: 'IN_APP',
        priority: 'HIGH',
        title: 'Nueva factura disponible',
        message: 'Se ha generado la factura INV-2024-001 por 121.000€',
        metadata: { invoiceId: invoice1.id },
      },
      {
        userId: contractor1.id,
        type: 'IN_APP',
        priority: 'NORMAL',
        title: 'Tarea asignada',
        message: 'Se te ha asignado la tarea "Diseño arquitectónico"',
      },
      {
        userId: contractor2.id,
        type: 'IN_APP',
        priority: 'NORMAL',
        title: 'Nueva tarea disponible',
        message: 'Tienes una nueva tarea: "Cálculo estructural"',
      },
    ],
  });

  console.log('✅ Notificaciones creadas');

  // Crear permisos personalizados para contractor1
  // Por defecto, contractors tienen acceso limitado, pero le damos permisos extra
  await prisma.userPermission.createMany({
    data: [
      {
        userId: contractor1.id,
        resource: 'PROJECTS',
        action: 'VIEW',
        allowed: true,
      },
      {
        userId: contractor1.id,
        resource: 'TASKS',
        action: 'VIEW',
        allowed: true,
      },
      {
        userId: contractor1.id,
        resource: 'TASKS',
        action: 'EDIT',
        allowed: true,
      },
      {
        userId: contractor1.id,
        resource: 'FILES',
        action: 'VIEW',
        allowed: true,
      },
      {
        userId: contractor1.id,
        resource: 'FILES',
        action: 'CREATE',
        allowed: true,
      },
      {
        userId: contractor1.id,
        resource: 'DISCUSSIONS',
        action: 'VIEW',
        allowed: true,
      },
      {
        userId: contractor1.id,
        resource: 'DISCUSSIONS',
        action: 'CREATE',
        allowed: true,
      },
      // Denegar acceso a invoices y proposals
      {
        userId: contractor1.id,
        resource: 'INVOICES',
        action: 'VIEW',
        allowed: false,
      },
      {
        userId: contractor1.id,
        resource: 'PROPOSALS',
        action: 'VIEW',
        allowed: false,
      },
    ],
  });

  console.log('✅ Permisos personalizados creados');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Usuarios de prueba:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:      admin@obra360.com       | Password123!');
  console.log('👤 PM:         pm@obra360.com          | Password123!');
  console.log('👤 Cliente 1:  cliente1@example.com    | Password123!');
  console.log('👤 Cliente 2:  cliente2@example.com    | Password123!');
  console.log('👤 Contractor: arquitecto@example.com  | Password123!');
  console.log('👤 Contractor: ingeniero@example.com   | Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
