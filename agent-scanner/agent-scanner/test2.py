#!/usr/bin/env python3
"""
🔥 AGENT IA GROQ - ANALYSE COMPLÈTE PROJET
Analyse TOUS les fichiers avec Groq
Relations fichiers + Endpoints + Rôle exact
"""

import os
import json
import sys
import time
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

# ==================== IMPORTS ====================
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("⚠️  pip install groq")

try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

# ==================== DATA CLASSES ====================

@dataclass
class FileInfo:
    path: str
    size: int
    content: str
    language: str
    imports: List[str]
    endpoints: List[str]

@dataclass
class AnalysisResult:
    file_path: str
    role: str
    relations: List[str]
    structure: str
    endpoints: List[str]
    problems: str
    raw_analysis: str

# ==================== CONFIGURATION ====================

EXCLUDED_DIRS = {
    '.git', '.venv', 'venv', 'env', 'Lib', 'site-packages', '__pycache__',
    'node_modules', 'dist', 'build', '.angular', 'vite', '.cache', 'target',
    'Scripts', 'pip', 'setuptools', 'wheel', '.tsc', '.next', 'coverage',
    '.nyc_output', '.pytest_cache', 'htmlcov', '.gradle', '.idea'
}

EXCLUDED_EXT = {
    '.pyc', '.pyd', '.dist-info', '.egg-info', '.log', '.map', '.whl',
    '.ico', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.pdf', '.db',
    '.sqlite', '.zip', '.tar', '.gz'
}

LANGUAGE_MAP = {
    '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
    '.java': 'Java', '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML',
    '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.md': 'Markdown',
    '.xml': 'XML', '.ftl': 'FreeMarker', '.properties': 'Properties',
    '.gradle': 'Gradle', '.jsp': 'JSP', '.go': 'Go', '.rs': 'Rust',
    '.php': 'PHP', '.sql': 'SQL', '.sh': 'Shell', '.bash': 'Bash'
}

# ==================== MAIN CLASS ====================

class ProjectAnalyzerFinal:
    """Analyseur de projet avec Groq"""
    
    def __init__(self, project_path: str = None):
        """Initialisation"""
        
        # Vérifier Groq
        if not GROQ_AVAILABLE:
            raise RuntimeError("❌ groq non installé: pip install groq")
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("❌ GROQ_API_KEY manquante dans .env")
        
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"
        
        # Chemin du projet
        if project_path is None:
            project_path = self._get_project_path()
        
        self.project_root = Path(project_path).resolve()
        
        if not self.project_root.exists():
            raise ValueError(f"❌ Chemin invalide: {self.project_root}")
        if not self.project_root.is_dir():
            raise ValueError(f"❌ Pas un répertoire: {self.project_root}")
        
        # Data
        self.files_data: Dict[str, FileInfo] = {}
        self.analyses: Dict[str, AnalysisResult] = {}
        self.file_relations: Dict[str, Set[str]] = {}
        self.all_imports: Dict[str, List[str]] = {}
    
    @staticmethod
    def _get_project_path() -> str:
        """Input du chemin du projet"""
        print("\n" + "="*80)
        print("🔥 AGENT IA - ANALYSE COMPLÈTE AVEC GROQ")
        print("="*80)
        
        while True:
            path = input("\n📂 Chemin du projet (ou QUIT):\n>>> ").strip().strip('"\'')
            
            if path.lower() == 'quit':
                sys.exit(0)
            
            test = Path(path)
            if test.exists() and test.is_dir():
                files = list(test.glob('*'))
                if not files:
                    print("⚠️  Répertoire vide")
                    continue
                
                print(f"✅ {test.absolute()}")
                if input("Analyser ? (oui/non): ").lower() in ['oui','o','y','yes']:
                    return str(test)
            else:
                print("❌ Chemin invalide")
    
    def should_skip_file(self, file_path: Path) -> bool:
        """Doit-on ignorer ce fichier?"""
        
        # Répertoires exclus
        if any(d in file_path.parts for d in EXCLUDED_DIRS):
            return True
        
        # Extensions exclues
        if file_path.suffix.lower() in EXCLUDED_EXT:
            return True
        
        # Taille
        size = file_path.stat().st_size
        if size < 50 or size > 300000:
            return True
        
        # Cache files
        name = file_path.name.lower()
        if any(p in name for p in ['chunk-', '.map', '_metadata', '.js.map', '.css.map']):
            return True
        
        return False
    
    def get_language(self, file_path: Path) -> str:
        """Déterminer le langage"""
        return LANGUAGE_MAP.get(file_path.suffix.lower(), 'Unknown')
    
    def extract_imports(self, content: str) -> List[str]:
        """Extrait les imports/dépendances"""
        imports = set()
        
        patterns = [
            # JavaScript/TypeScript
            r"from ['\"]\.\/([^'\"]+)['\"]",
            r"from ['\"]\.\.\/([^'\"]+)['\"]",
            r"import.*from ['\"]([^'\"]+)['\"]",
            r"require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
            # Python
            r"from \.([a-zA-Z0-9_.-]+) import",
            r"from \.\.([a-zA-Z0-9_.-]+) import",
            r"import ([a-zA-Z0-9_.-]+)",
            # Java
            r"import\s+([a-zA-Z0-9_.]+);",
        ]
        
        for pattern in patterns:
            for match in re.findall(pattern, content, re.MULTILINE):
                match = match.strip()
                if match and not match.startswith('http') and 'java.' not in match:
                    imports.add(match)
        
        return sorted(list(imports))[:8]
    
    def extract_endpoints(self, content: str) -> List[str]:
        """Extrait les endpoints API"""
        endpoints = set()
        
        patterns = [
            # Spring Java
            r'@(?:Get|Post|Put|Delete|Patch)Mapping\s*\(\s*["\']([^"\']+)["\']',
            r'@RequestMapping\s*\(\s*(?:value\s*=\s*)?["\']([^"\']+)["\']',
            # Express/Node
            r'\.(?:get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']',
            # Angular/TypeScript
            r'@(?:app|router)\.(?:get|post|put|delete)\s*\(\s*["\']([^"\']+)["\']',
            # HttpClient Angular
            r'http(?:Get|Post|Put|Delete)\s*\(\s*["\']([^"\']+)["\']',
            # Router definitions
            r"path:\s*['\"]([^'\"]+)['\"]",
        ]
        
        for pattern in patterns:
            for match in re.findall(pattern, content, re.IGNORECASE | re.MULTILINE):
                if match and not match.startswith('http://') and not match.startswith('https://'):
                    endpoints.add(match)
        
        return sorted(list(endpoints))[:5]
    
    def scan_project(self) -> None:
        """SCAN complet du projet"""
        print("\n🔍 Scan du projet (tous les fichiers)...")
        
        count = 0
        skipped = 0
        
        for file_path in self.project_root.rglob('*'):
            if not file_path.is_file():
                continue
            
            if self.should_skip_file(file_path):
                skipped += 1
                continue
            
            try:
                relative = file_path.relative_to(self.project_root)
                size = file_path.stat().st_size
                
                # Lire le contenu
                content = ""
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                except:
                    content = ""
                
                if not content:
                    continue
                
                lang = self.get_language(file_path)
                imports = self.extract_imports(content)
                endpoints = self.extract_endpoints(content)
                
                self.files_data[str(relative)] = FileInfo(
                    path=str(relative),
                    size=size,
                    content=content,
                    language=lang,
                    imports=imports,
                    endpoints=endpoints
                )
                
                self.all_imports[str(relative)] = imports
                
                count += 1
                
            except Exception as e:
                skipped += 1
        
        print(f"✅ {count} fichiers scannés | ⏭️  {skipped} ignorés")
    
    def build_relations(self) -> None:
        """Construit la carte des relations"""
        print("🔗 Construction des relations fichiers...")
        
        for file_path, imports in self.all_imports.items():
            self.file_relations[file_path] = set()
            
            for imp in imports:
                # Chercher les fichiers correspondants
                imp_clean = imp.replace('..', '').replace('./', '')
                
                for other_path in self.files_data.keys():
                    if imp_clean in other_path or other_path.endswith(f"{imp_clean}.ts"):
                        self.file_relations[file_path].add(other_path)
    
    def analyze_file_with_groq(self, file_path: str, info: FileInfo) -> AnalysisResult:
        """🔥 Analyse RÉELLE avec Groq"""
        
        print(f"   📡 Groq analyse {file_path}...")
        
        prompt = f"""ANALYSE COMPLÈTE ET PRÉCISE ce fichier:

📁 FICHIER: {file_path}
🌐 LANGAGE: {info.language}
💾 TAILLE: {info.size} bytes

🔗 IMPORTS DÉTECTÉS:
{chr(10).join(f"  • {i}" for i in info.imports) if info.imports else "  ❌ Aucun"}

📡 ENDPOINTS DÉTECTÉS:
{chr(10).join(f"  • {e}" for e in info.endpoints) if info.endpoints else "  ❌ Aucun"}

🔴 CODE (5000 caractères):
```{info.language.lower()}
{info.content[:5000]}
```

ANALYSE (Sois ULTRA-PRÉCIS):

1️⃣  RÔLE EXACT (2-3 phrases):
[Qu'est-ce que ce fichier fait EXACTEMENT?]
[Quel est son objectif principal?]
[Quelle responsabilité unique a-t-il?]

2️⃣  FICHIERS RELIÉS:
[Liste les fichiers importants liés]
[Qui l'utilise? Qu'est-ce qu'il utilise?]
[Flux de données entre fichiers]

3️⃣  STRUCTURE INTERNE:
[Classes/Services/Composants principaux]
[Méthodes/Fonctions clés (max 5)]
[Props/Variables importantes]

4️⃣  ENDPOINTS API:
{chr(10).join(f"  • {e}" for e in info.endpoints) if info.endpoints else "❌ Aucun"}

5️⃣  PROBLÈMES/OPTIMISATIONS:
[Max 3 problèmes ou améliorations]
[Recommandations d'actions]
[Code smell détectés]"""
        
        try:
            time.sleep(0.6)  # Rate limit Groq
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Expert code JavaScript/TypeScript/Java/Python. Analyse ULTRA-PRÉCISE. Français. Sois spécifique au code fourni."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=800,
                top_p=0.9
            )
            
            analysis_text = response.choices[0].message.content
            
            # Parser le résultat
            role = self._extract_section(analysis_text, "RÔLE EXACT")
            relations = self._extract_section(analysis_text, "FICHIERS RELIÉS")
            structure = self._extract_section(analysis_text, "STRUCTURE INTERNE")
            problems = self._extract_section(analysis_text, "PROBLÈMES")
            
            return AnalysisResult(
                file_path=file_path,
                role=role,
                relations=self._parse_list(relations),
                structure=structure,
                endpoints=info.endpoints,
                problems=problems,
                raw_analysis=analysis_text
            )
        
        except Exception as e:
            print(f"      ❌ Erreur Groq: {str(e)[:50]}")
            return AnalysisResult(
                file_path=file_path,
                role="[Erreur analyse]",
                relations=[],
                structure="[Erreur]",
                endpoints=info.endpoints,
                problems="[Erreur Groq]",
                raw_analysis=f"[Erreur: {str(e)[:100]}]"
            )
    
    @staticmethod
    def _extract_section(text: str, section: str) -> str:
        """Extrait une section du texte"""
        try:
            idx = text.upper().find(section.upper())
            if idx == -1:
                return "[Pas trouvé]"
            
            start = idx + len(section)
            end = text.find("\n\n", start)
            if end == -1:
                end = text.find("5️⃣", start)
            if end == -1:
                end = len(text)
            
            return text[start:end].strip()
        except:
            return "[Erreur parse]"
    
    @staticmethod
    def _parse_list(text: str) -> List[str]:
        """Parse une liste"""
        lines = text.split('\n')
        result = []
        for line in lines:
            line = line.strip()
            if line and line.startswith(('•', '-', '*')):
                result.append(line[1:].strip())
        return result[:5]
    
    def generate_report(self) -> str:
        """📊 Génère le rapport final"""
        
        report = []
        
        # Header
        report.extend([
            "="*130,
            "🔥 RAPPORT FINAL - ANALYSE COMPLÈTE AVEC GROQ IA",
            "="*130,
            f"📁 Projet: {self.project_root.absolute()}",
            f"📈 Fichiers analysés: {len(self.files_data)}",
            f"🤖 Modèle: {self.model}",
            f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            ""
        ])
        
        # Analyses fichier par fichier
        report.extend([
            "📋 ANALYSES COMPLÈTES - FICHIER PAR FICHIER",
            "="*130,
            ""
        ])
        
        sorted_files = sorted(self.files_data.keys())
        
        for i, file_path in enumerate(sorted_files, 1):
            info = self.files_data[file_path]
            
            print(f"[{i}/{len(sorted_files)}] Analyse {file_path}...")
            
            # Analyser avec Groq
            analysis = self.analyze_file_with_groq(file_path, info)
            self.analyses[file_path] = analysis
            
            # Ajouter au rapport
            report.extend([
                "",
                "="*130,
                f"📄 [{i}] {file_path}",
                "="*130,
                f"🌐 Langage: {info.language} | 💾 Taille: {info.size} bytes",
                ""
            ])
            
            report.extend([
                "1️⃣  RÔLE EXACT:",
                analysis.role,
                ""
            ])
            
            if analysis.relations:
                report.extend([
                    "2️⃣  FICHIERS RELIÉS:",
                ])
                for rel in analysis.relations:
                    report.append(f"   └─ {rel}")
                report.append("")
            
            report.extend([
                "3️⃣  STRUCTURE INTERNE:",
                analysis.structure,
                ""
            ])
            
            if analysis.endpoints:
                report.extend([
                    "4️⃣  ENDPOINTS API:",
                ])
                for ep in analysis.endpoints:
                    report.append(f"   └─ {ep}")
                report.append("")
            
            report.extend([
                "5️⃣  PROBLÈMES/OPTIMISATIONS:",
                analysis.problems,
                ""
            ])
        
        # Carte relationnelle
        report.extend([
            "",
            "="*130,
            "🔗 CARTE RELATIONNELLE FICHIERS",
            "="*130,
            ""
        ])
        
        for file_path in sorted(self.file_relations.keys()):
            relations = self.file_relations[file_path]
            if relations:
                report.append(f"📄 {file_path}")
                for rel in sorted(relations):
                    report.append(f"   ➜ {rel}")
                report.append("")
        
        # Statistiques
        report.extend([
            "",
            "="*130,
            "📊 STATISTIQUES",
            "="*130,
            ""
        ])
        
        langs = {}
        total_size = 0
        total_endpoints = 0
        
        for info in self.files_data.values():
            langs[info.language] = langs.get(info.language, 0) + 1
            total_size += info.size
            total_endpoints += len(info.endpoints)
        
        report.extend([
            f"Taille totale: {total_size/1024:.1f} KB",
            f"Nombre de fichiers: {len(self.files_data)}",
            f"Endpoints API trouvés: {total_endpoints}",
            f"Relations détectées: {len([r for rels in self.file_relations.values() if r for r in [rels]])}",
            "",
            "Langages:"
        ])
        
        for lang, count in sorted(langs.items(), key=lambda x: x[1], reverse=True):
            report.append(f"  • {lang}: {count}")
        
        report.extend([
            "",
            "="*130,
            "✅ ANALYSE TERMINÉE AVEC SUCCÈS",
            "="*130
        ])
        
        return "\n".join(report)
    
    def run(self):
        """Lance l'analyse complète"""
        try:
            print("🚀 Démarrage de l'analyse...")
            
            self.scan_project()
            self.build_relations()
            
            report = self.generate_report()
            
            print("\n" + report)
            
            # Sauvegarder
            output = self.project_root / "RAPPORT_GROQ_FINAL.txt"
            with open(output, 'w', encoding='utf-8') as f:
                f.write(report)
            
            print(f"\n💾 Rapport sauvegardé: {output}")
            
        except KeyboardInterrupt:
            print("\n⚠️  Analyse interrompue")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Erreur: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

# ==================== MAIN ====================

def main():
    print("""
╔═════════════════════════════════════════════════════════════════╗
║  🔥 AGENT IA GROQ - ANALYSE COMPLÈTE PROJET                    ║
║  • Tous les fichiers analysés                                  ║
║  • Groq AI pour rôle exact de chaque fichier                   ║
║  • Relations fichiers + Endpoints + Problèmes                  ║
║  • Rapport professionnel complet                               ║
╚═════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        path = sys.argv[1] if len(sys.argv) > 1 else None
        analyzer = ProjectAnalyzerFinal(path)
        analyzer.run()
    except Exception as e:
        print(f"\n❌ Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()