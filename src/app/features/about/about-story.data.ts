export const ABOUT_PASSAGES = [
  ['I TURN IDEAS INTO DIGITAL EXPERIENCES.'],
  ['FOR ME, TECHNOLOGY IS MORE THAN CODE.'],
  ["IT'S ABOUT CREATING, EXPLORING,", 'AND BUILDING SOMETHING MEANINGFUL.'],
];

export interface AboutTechnology {
  name: string;
  icon?: string;
  symbol?: 'leaf' | 'database' | 'branch';
}

const technology = (name: string, icon: string): AboutTechnology => ({
  name, icon: `${import.meta.env.BASE_URL}assets/skills/${icon}.svg`,
});

export const ABOUT_TECHNOLOGIES: AboutTechnology[][] = [
  [
    technology('Angular', 'angular'), technology('TypeScript', 'typescript'),
    technology('Java', 'java'), { name: 'Spring Boot', symbol: 'leaf' },
    technology('.NET', 'dotnet'), technology('Python', 'python'),
    technology('SQL', 'sql'), technology('Power BI', 'power-bi'),
  ],
  [
    technology('Microsoft Fabric', 'fabric'), technology('Azure', 'azure'),
    technology('GitHub', 'github'), technology('Docker', 'docker'),
    technology('Figma', 'figma'), { name: 'PostgreSQL', symbol: 'database' },
    technology('VS Code', 'vscode'),
  ],
];
