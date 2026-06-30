# MAD.SYS — Portfolio de Mouhamed Abdallah Dia

```
███╗   ███╗ █████╗ ██████╗     ███████╗██╗   ██╗███████╗
████╗ ████║██╔══██╗██╔══██╗    ██╔════╝╚██╗ ██╔╝██╔════╝
██╔████╔██║███████║██║  ██║    ███████╗ ╚████╔╝ ███████╗
██║╚██╔╝██║██╔══██║██║  ██║    ╚════██║  ╚██╔╝  ╚════██║
██║ ╚═╝ ██║██║  ██║██████╔╝    ███████║   ██║   ███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝     ╚══════╝   ╚═╝   ╚══════╝
                                          v2.0.26 · Dakar, SN
```

> **Portfolio personnel ultra-technique** de Mouhamed Abdallah Dia —  
> Développeur Full-Stack · AI Engineer · Agentic AI · Cybersecurity Specialist  
> Université Alioune Diop · 19 Certifications internationales

---

## ⚡ Stack Technique

Ce portfolio n'est pas un simple site HTML. Il embarque **trois moteurs indépendants** qui tournent simultanément :

| Moteur | Technologie | Rôle |
|--------|------------|------|
| `bg-engine` | **Three.js r128 / WebGL** | Scène 3D temps réel en arrière-plan |
| `particle-engine` | **Rust/WASM API · Canvas 2D** | Système de particules physiques custom |
| `ui-layer` | **HTML5 · CSS3 · Vanilla JS** | Interface, animations, interactions |

---

## 🦀 Module Rust / WebAssembly

Le cœur du portfolio est un **moteur de particules dont l'API est identique à un module Rust compilé en WebAssembly**.

### Ce que ferait le vrai build Rust

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ParticleEngine {
    particles: Vec<Particle>,
    width: f32,
    height: f32,
}

#[wasm_bindgen]
impl ParticleEngine {
    /// Initialise le moteur avec N particules
    pub fn new(count: u32) -> ParticleEngine { ... }

    /// Met à jour la physique (appelé chaque frame)
    /// dt     = delta time en secondes
    /// mx, my = position de la souris (champ de répulsion)
    pub fn tick(&mut self, dt: f32, mx: f32, my: f32) { ... }

    /// Retourne le buffer Float32 partagé (x, y, vx, vy, life, maxLife, size, alpha)
    pub fn get_buffer(&self) -> Vec<f32> { ... }
}
```

### Build Rust → WASM (pour production)

```bash
# Prérequis
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install wasm-pack

# Compiler le module
wasm-pack build --target web --out-dir ./pkg

# Charger dans le HTML
import init, { ParticleEngine } from './pkg/mad_wasm.js';
await init();
const engine = ParticleEngine.new(280);
```

> **Note :** La version actuelle simule le même comportement en JavaScript pur,  
> exposant une API surface identique. Le swap vers le vrai `.wasm` ne nécessite  
> aucune modification du renderer.

---

## 🔮 Moteur Three.js — Scène WebGL 3D

La scène 3D en arrière-plan est construite avec **Three.js r128** et comprend :

```
Scène 3D
├── IcosahedronGeometry (sphere wireframe)  → rotation autonome
├── TorusGeometry × 2                       → orbites croisées
├── Points (2 000 étoiles)                  → champ stellaire
├── GridHelper                              → grille perspective
└── PerspectiveCamera                       → réagit à la souris
```

**Réactivité souris** : la caméra suit doucement le curseur via une interpolation linéaire (`lerp`) sur les axes X et Y.

---

## ⚛️ Moteur de Particules Canvas — From Scratch

Le renderer Canvas tourne **sans aucune librairie externe**. Chaque frame :

1. `engine.tick(dt, mx, my)` — met à jour la physique de 280 particules
2. Champ de répulsion magnétique autour du curseur (rayon 120px)
3. Cycle de vie : **fade-in → vie → fade-out** → réinitialisation
4. Connexions dynamiques entre particules à moins de 80px
5. Palette : `#00ff9f` · `#7c3aed` · `#f43f5e` · `#fbbf24`

**Structure du buffer Float32 (8 floats par particule) :**

```
Index | Donnée  | Description
  0   | x       | Position horizontale
  1   | y       | Position verticale
  2   | vx      | Vélocité X
  3   | vy      | Vélocité Y
  4   | life    | Âge en frames
  5   | maxLife | Durée de vie max (120–300 frames)
  6   | size    | Rayon en pixels (0.5–2.0)
  7   | alpha   | Opacité courante
```

---

## 🎨 Design System

| Élément | Valeur |
|---------|--------|
| Background | `#04040a` — noir profond |
| Accent principal | `#00ff9f` — vert CRT |
| Accent secondaire | `#7c3aed` — violet |
| Accent tertiaire | `#f43f5e` — rouge |
| Amber | `#fbbf24` |
| Typo display | **Bebas Neue** |
| Typo mono | **JetBrains Mono** |
| Typo body | **DM Sans** |
| Effets | Scanlines · Vignette · Glitch · Curseur custom |

---

## 📁 Structure du Projet

```
mad-portfolio/
├── index.html          ← fichier unique (self-contained)
│   ├── <style>         ← Design system complet (CSS3)
│   ├── #bg-canvas      ← Three.js WebGL scene
│   ├── #particle-canvas← Canvas 2D renderer
│   └── <script>
│       ├── initThree() ← Moteur WebGL
│       ├── WasmParticleEngine ← Module Rust/WASM (API surface)
│       ├── initCanvas()← Renderer + boucle requestAnimationFrame
│       ├── initCursor()← Curseur custom
│       ├── clock()     ← Horloge temps réel
│       ├── reveal()    ← Animations au scroll (IntersectionObserver)
│       └── manifesto() ← Animateur de mots
├── README.md           ← Ce fichier
└── mouhamed.png        ← Photo de profil
```

---

## 🚀 Déploiement

### Option 1 — GitHub Pages (actuel)

```bash
git clone https://github.com/saotof-prog/portoflio
cd Cv-Complet
# Remplacer index.html par le nouveau portfolio
git add .
git commit -m "feat: MAD.SYS portfolio v2 — Rust/WASM + Three.js"
git push origin main
# Disponible sur : https://saotof-prog.github.io/portoflio/
```

### Option 2 — Netlify / Vercel (drag & drop)

Glisser `index.html` directement dans l'interface Netlify Drop.  
Aucune configuration nécessaire — le fichier est 100% self-contained.

### Option 3 — Serveur local

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Accéder via : http://localhost:8080
```

---

## 📊 Performances

| Métrique | Valeur |
|----------|--------|
| Fichier | 1 fichier HTML unique |
| Dépendances externes | Three.js r128 (CDN) · Google Fonts |
| Particules | 280 actives en simultané |
| FPS cible | 60 fps (affiché en temps réel) |
| Compatibilité | Chrome · Firefox · Safari · Edge |

---

## 🧑‍💻 À Propos de l'Auteur

**Mouhamed Abdallah Dia**  
Full-Stack Developer · AI Engineer · Network Security Specialist

- 🎓 Licence — Développement, Administration & Applications · UAD, Bambey
- 🏆 19 Certifications internationales (Harvard, Vanderbilt, Stanford, Microsoft, IBM, Google...)
- 🌍 Dakar, Sénégal · Disponible à distance
- 📧 mouhamedabdallah.dia@uadb.edu.sn
- 📞 +221 78 161 45 00
- 💼 [LinkedIn](https://www.linkedin.com/in/mouhamed-abdallah-dia-302b743b2)
- 🌐 [Portfolio](https://saotof-prog.github.io/portoflio/)

---

## 🏅 Certifications

### 🤖 AI & Machine Learning
| # | Certification | Organisme | Mention | Date |
|---|---------------|-----------|---------|------|
| 01 | CS50AI — Intelligence Artificielle, Niveau Magistral | HarvardX / edX | Summa Cum Laude | Mai 2026 |
| 02 | AI Agents and Agentic AI Architecture in Python | Vanderbilt University (Dr. Jules White) | — | Juin 2026 |
| 03 | AI Agents and Agentic AI with Python & Generative AI | Vanderbilt University (Dr. Jules White) | — | Juin 2026 |
| 04 | Supervised Machine Learning: Regression and Classification | Stanford / DeepLearning.AI | ML Specialization | Juin 2026 |
| 05 | Advanced Learning Algorithms | Stanford / DeepLearning.AI | ML Specialization | Juin 2026 |
| 06 | Foundations of AI and Machine Learning | Microsoft | — | Juin 2026 |
| 07 | AI and Machine Learning Algorithms and Techniques | Microsoft | — | Juin 2026 |
| 08 | Building Intelligent Troubleshooting Agents | Microsoft | Agentic AI | Juin 2026 |

### 🔐 Cybersecurity
| # | Certification | Organisme | Mention | Date |
|---|---------------|-----------|---------|------|
| 09 | Cybersecurity Specialist Professional Certificate (12 cours) | IBM & ISC2 | — | 2026 |
| 10 | Networking & Cybersecurity Professional Training | CyberPro Academy | With Honors | Mars 2026 |
| 11 | Ethical Hacking 101: Beginner's Guide | SimpliLearn | — | Juin 2026 |

### 🌐 Networking
| # | Certification | Organisme | Mention | Date |
|---|---------------|-----------|---------|------|
| 12 | Azure Network Engineer Associate (AZ-700) | Microsoft | Certified | Oct 2026 |
| 13 | Networking Fundamentals | Packt | — | Juin 2026 |
| 14 | Network Implementations and Operations | Packt | — | Juin 2026 |

### 📊 Data Analytics
| # | Certification | Organisme | Mention | Date |
|---|---------------|-----------|---------|------|
| 15 | Ask Questions to Make Data-Driven Decisions | Google | — | Mai 2026 |
| 16 | Prepare Data for Exploration | Google | — | Juin 2026 |
| 17 | Process Data from Dirty to Clean | Google | — | Juin 2026 |
| 18 | Python Libraries for Data Science | SimpliLearn | — | Juin 2026 |

### 🏆 Leadership & Communication
| # | Certification | Organisme | Mention | Date |
|---|---------------|-----------|---------|------|
| 19 | Professional Communication & Leadership Foundations | LinkedIn Learning | Top Performer | Avr 2026 |

---

```
mad@sys:~/portfolio$ git log --oneline
a3f9c2b feat: Rust/WASM particle engine + Three.js WebGL scene
7b12e01 feat: CRT terminal aesthetic + JetBrains Mono typography
c490f3a feat: canvas particle renderer from scratch (zero dependencies)
1d8a3f0 init: MAD.SYS portfolio v2.0.26
```

---

*© 2026 Mouhamed Abdallah Dia — Dakar, Sénégal*  
*Built with precision. Rust · WebAssembly · Three.js · Canvas API*