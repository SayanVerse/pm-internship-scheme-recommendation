import { PrismaClient, EducationLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create skills
  const skills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'SQL', 'HTML/CSS', 'Excel', 'PowerBI', 'Tableau', 
    'Communication', 'Leadership', 'Project Management', 
    'Data Analysis', 'Digital Marketing', 'Content Writing',
    'Field Work', 'Research', 'Teaching', 'Customer Service',
    'Agriculture', 'Healthcare', 'Finance', 'Operations'
  ];

  for (const skillName of skills) {
    await prisma.skill.upsert({
      where: { slug: skillName.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: {
        name: skillName,
        slug: skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      }
    });
  }

  console.log('✅ Skills created');

  // Create sample internships
  const internships = [
    {
      title: "Software Development Intern",
      sector: "IT",
      orgName: "TechStart Solutions",
      description: "Work on web applications using React and Node.js",
      stipendMin: 15000,
      stipendMax: 25000,
      city: "Bangalore",
      state: "Karnataka",
      pin: "560001",
      remote: true,
      minEducation: EducationLevel.UNDERGRADUATE,
      applicationUrl: "https://techstart.com/apply",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      requiredSkills: ["JavaScript", "React", "Node.js", "HTML/CSS"]
    },
    {
      title: "Data Analysis Intern",
      sector: "Healthcare",
      orgName: "MedData Analytics",
      description: "Analyze healthcare data and create insights using Python and Excel",
      stipendMin: 12000,
      stipendMax: 18000,
      city: "Mumbai",
      state: "Maharashtra", 
      pin: "400001",
      remote: false,
      minEducation: EducationLevel.UNDERGRADUATE,
      applicationUrl: "https://meddata.com/careers",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Python", "Excel", "Data Analysis", "Research"]
    },
    {
      title: "Agricultural Extension Intern",
      sector: "Agriculture",
      orgName: "FarmTech Initiative",
      description: "Support farmers with modern agricultural techniques and technology adoption",
      stipendMin: 8000,
      stipendMax: 12000,
      city: "Pune",
      state: "Maharashtra",
      pin: "411001", 
      remote: false,
      minEducation: EducationLevel.DIPLOMA,
      applicationUrl: "https://farmtech.gov.in/apply",
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Agriculture", "Field Work", "Communication", "Teaching"]
    },
    {
      title: "Education Technology Intern",
      sector: "Education",
      orgName: "EduInnovate",
      description: "Develop educational content and support online learning platforms",
      stipendMin: 10000,
      stipendMax: 15000,
      city: "Delhi",
      state: "Delhi",
      pin: "110001",
      remote: true,
      minEducation: EducationLevel.UNDERGRADUATE,
      applicationUrl: "https://eduinnovate.org/join",
      deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Content Writing", "Teaching", "Research", "Digital Marketing"]
    },
    {
      title: "Public Health Analyst Intern",
      sector: "Public Admin",
      orgName: "National Health Mission",
      description: "Support public health programs and analyze health data at district level",
      stipendMin: 15000,
      stipendMax: 20000,
      city: "Chennai",
      state: "Tamil Nadu",
      pin: "600001",
      remote: false,
      minEducation: EducationLevel.POSTGRADUATE,
      applicationUrl: "https://nhm.gov.in/internships",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Data Analysis", "Research", "Excel", "Project Management"]
    },
    {
      title: "Digital Marketing Intern",
      sector: "IT",
      orgName: "GrowthHack Digital",
      description: "Create digital marketing campaigns and analyze performance metrics",
      stipendMin: 8000,
      stipendMax: 14000,
      city: "Hyderabad",
      state: "Telangana",
      pin: "500001",
      remote: true,
      minEducation: EducationLevel.TENTH_PLUS_TWO,
      applicationUrl: "https://growthhack.in/careers",
      deadline: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Digital Marketing", "Content Writing", "Data Analysis", "Communication"]
    },
    {
      title: "Financial Analyst Intern",
      sector: "Finance", 
      orgName: "FinServ Corporation",
      description: "Support financial planning and analysis for rural microfinance programs",
      stipendMin: 12000,
      stipendMax: 18000,
      city: "Jaipur",
      state: "Rajasthan",
      pin: "302001",
      remote: false,
      minEducation: EducationLevel.UNDERGRADUATE,
      applicationUrl: "https://finserv.com/apply",
      deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Finance", "Excel", "Data Analysis", "Operations"]
    }
  ];

  for (const internshipData of internships) {
    const { requiredSkills, ...internship } = internshipData;
    
    const createdInternship = await prisma.internship.create({
      data: internship
    });

    // Link required skills
    for (const skillName of requiredSkills) {
      const skill = await prisma.skill.findFirst({
        where: { name: skillName }
      });
      
      if (skill) {
        await prisma.internshipSkill.create({
          data: {
            internshipId: createdInternship.id,
            skillId: skill.id
          }
        });
      }
    }
  }

  console.log('✅ Sample internships created');

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@pminternship.gov.in' },
    update: {},
    create: {
      email: 'admin@pminternship.gov.in',
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
