export const MODULES = [
    {
        id: 'mod_1',
        title: 'Infrastructuur & Speakers',
        order: 1
    },
    {
        id: 'mod_5',
        title: 'Licht Hardware & Infra',
        order: 5
    },
    {
        id: 'mod_9',
        title: 'Het Eindexamen',
        order: 9
    }
];

export const LESSONS = [
    {
        id: 'week_1',
        moduleId: 'mod_1',
        title: 'Week 1: Anatomie van de Kabel',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Test URL (Spark Plan)
        handoutContent: `# Week 1: Anatomie van de Kabel

## Inleiding
Kabels zijn de levensader van elke productie.

### Soorten Kabels
- **XLR**: Gebalanceerd, voor microfoons en DMX.
- **Speakon**: Voor luidsprekers, high current.
- **Ethercon**: Robuuste RJ45 voor digitale audio (Dante/AES50).

## Veiligheid
Rol kabels altijd "over-under" op om slag te voorkomen.`,
        order: 1
    },
    {
        id: 'week_19',
        moduleId: 'mod_5',
        title: 'Week 19: Stroom & Veiligheid (400V)',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        handoutContent: `# Stroom & Veiligheid

**LET OP:** 400V Krachtstroom is dodelijk.

## Powerlock
De standaard voor grote verdelers. Volgorde van aansluiten:
1. **Aarde** (Groen/Geel) - ALTIJD EERST!
2. **Nul** (Blauw)
3. **Fase 1, 2, 3** (Bruin, Zwart, Grijs)

Afkoppelen in _omgekeerde_ volgorde.`,
        order: 1
    },
    {
        id: 'week_40',
        moduleId: 'mod_9',
        title: 'Week 40: De Finale',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        handoutContent: `# De Finale

Gefeliciteerd met het behalen van de eindstreep.

## Opdracht
Bouw een volledige FOH setup in < 30 minuten.
- Mengtafel patchen
- Systeem EQ inregelen
- Soundcheck uitvoeren`,
        order: 1
    }
];

export const getLesson = (id: string) => LESSONS.find(l => l.id === id);
export const getModule = (id: string) => MODULES.find(m => m.id === id);
