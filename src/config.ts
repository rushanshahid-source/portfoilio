export interface Project {
    id: number;
    title: string;
    category: string;
    technologies: string;
    image: string;
    description: string;
    github_url?: string;
    live_demo_url?: string;
}

export interface Experience {
    id?: number;
    position: string;
    company: string;
    period: string;
    location: string;
    description: string;
    responsibilities: string[];
    technologies: string[];
}

export const config = {
    developer: {
        name: "Rushaan",
        fullName: "Rushaan Shahid",
        title: "Cybersecurity Enthusiast & Software Developer",
        description: "Cybersecurity Intern and Computer Science undergraduate building a strong foundation in C++ Object-Oriented Programming, web development, and cybersecurity fundamentals. Passionate about restructuring logical software systems, leading student-driven platforms, and applying analytical problem-solving to defensive and offensive security tasks."
    },
    social: {
        github: "RushaanShahid",
        email: "rushanshahid@gmail.com",
        location: "Taxila, Punjab, Pakistan"
    },
    about: {
        title: "About Me",
        description: "I'm a Computer Science undergraduate at Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology, currently in my 2nd semester. I have a strong foundation in C++ (procedural & object-oriented programming), web development with HTML5/CSS3, and an active pursuit of cybersecurity fundamentals through self-study. I've founded and led Campus Connect, a student marketplace and academic collaboration platform, coordinating a multidisciplinary team of 10 members. I enjoy transforming procedural code into clean, scalable, object-oriented architecture, and I'm eager to apply my debugging and analytical skills to real-world security challenges."
    },
    experiences: [
        {
            position: "Founder & Product Lead",
            company: "Campus Connect — Student Marketplace & Academic Collaboration Platform",
            period: "2026 - Present",
            location: "Pak-Austria Fachhochschule, Pakistan",
            description: "Conceived and directed the development of a digital platform designed to connect students for academic collaboration, resource exchange, and campus services, as an entrepreneurial initiative at PAF-IAST.",
            responsibilities: [
                "Led project planning, feature design, and workflow management",
                "Coordinated a multidisciplinary team of 10 members",
                "Conducted requirement analysis for user-focused solutions",
                "Oversaw implementation to improve campus engagement"
            ],
            technologies: ["Product Development", "Full-Stack Development", "Leadership", "Project Management", "Team Collaboration"]
        },
        {
            position: "Project Lead & C++ Developer",
            company: "Airport Management System — Object-Oriented Software Redesign",
            period: "Semester 2, PAF-IAST",
            location: "Pak-Austria Fachhochschule, Pakistan",
            description: "Redesigned an existing airport management application by transforming procedural code into a scalable object-oriented architecture.",
            responsibilities: [
                "Applied core OOP concepts to improve maintainability and reusability",
                "Improved system organization through better software architecture",
                "Investigated and resolved functional issues through testing",
                "Optimized code through debugging and performance improvements"
            ],
            technologies: ["C++", "Object-Oriented Design", "Software Engineering", "Debugging", "Problem Solving"]
        },
        {
            position: "Web Development Team Member",
            company: "Book Management System Website",
            period: "ICT Coursework, 2025",
            location: "Pak-Austria Fachhochschule, Pakistan",
            description: "Developed key components of an online book management platform focused on efficient catalog organization and user accessibility.",
            responsibilities: [
                "Implemented responsive web interfaces and structured layouts",
                "Enhanced usability across desktop and mobile devices",
                "Collaborated with team members within academic timelines",
                "Delivered project objectives on schedule"
            ],
            technologies: ["HTML5", "CSS3", "Responsive Design", "Front-End Development", "Collaboration"]
        }
    ] as Experience[],
    projects: [
        {
            id: 1,
            title: "Campus Connect",
            category: "Full Stack / Entrepreneurship",
            technologies: "Full-Stack Development, Product Design, Project Management",
            image: "/images/project-1.webp",
            description: "A student marketplace and academic collaboration platform connecting students for resource exchange and campus services. Founded and led as an entrepreneurial initiative, coordinating a 10-person multidisciplinary team from concept to implementation."
        },
        {
            id: 2,
            title: "Airport Management System",
            category: "C++ / OOP",
            technologies: "C++, Object-Oriented Design, Software Engineering",
            image: "/images/project-2.webp",
            description: "A redesign of an existing airport management application, transforming procedural code into a scalable object-oriented architecture. Improved maintainability, reusability, and system organization through applied OOP principles and rigorous debugging."
        },
        {
            id: 3,
            title: "Book Management System",
            category: "Web Development",
            technologies: "HTML5, CSS3, Responsive Design",
            image: "/images/project-3.webp",
            description: "An online book management and catalog platform built as ICT coursework. Focused on efficient catalog organization, accessibility, and responsive interfaces that work smoothly across devices."
        }
    ] as Project[],
    contact: {
        email: "rushanshahid@gmail.com",
        github: "https://github.com/RushaanShahid",
        linkedin: "https://linkedin.com/in/rushaanshahid",
        twitter: "https://x.com/rushaanshahid",
        facebook: "https://www.facebook.com/rushaanshahid",
        instagram: "https://www.instagram.com/rushaanshahid"
    },
    skills: {
        develop: {
            title: "C++ DEVELOPER",
            description: "Building scalable, object-oriented software systems",
            details: "Redesigning procedural systems into clean object-oriented architecture using C++. Strong grounding in data structures, system logic analysis, and debugging for maintainable software.",
            tools: ["C++", "Object-Oriented Design", "Data Structures", "Software Engineering", "Debugging", "System Logic Analysis", "Problem Solving"]
        },
        design: {
            title: "WEB & SECURITY",
            description: "Front-end development and cybersecurity fundamentals",
            details: "Building responsive, accessible web interfaces with HTML5 and CSS3, alongside an active self-study path in cybersecurity fundamentals for defensive and offensive security tasks.",
            tools: ["HTML5", "CSS3", "Responsive Design", "Cybersecurity Fundamentals", "Front-End Development", "Collaboration"]
        }
    }
};
