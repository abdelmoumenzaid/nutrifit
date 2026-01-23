#!/usr/bin/env python3
"""
Agent IA pour analyser la structure d'un projet Python/Node.js
Utilise l'API Groq pour fournir des analyses intelligentes et des suggestions.
Version PROPRE - Filtre cache Angular/Vite + Rate limiting + Arbre parfait
"""

import os
import json
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple, Set
from dataclasses import dataclass
import warnings

# Supprime les avertissements
warnings.filterwarnings('ignore')

from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

@dataclass
class FileInfo:
    """Informations sur un fichier du projet"""
    path: str
    size: int
    content_preview: str
    language: str

class ProjectAnalyzer:
    """Analyseur de projet utilisant l'API Groq - Version PROPRE"""
    
    def __init__(self, project_path: str = None):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        
        if project_path is None:
            project_path = self._get_project_path()
        
        self.project_root = Path(project_path).resolve()
        
        if not self.project_root.exists():
            raise ValueError(f"❌ Le chemin n'existe pas: {self.project_root}")
        if not self.project_root.is_dir():
            raise ValueError(f"❌ Ce n'est pas un répertoire: {self.project_root}")
        if not self.groq_api_key:
            raise ValueError("❌ GROQ_API_KEY non configurée dans .env")
        
        self.files_data: Dict[str, FileInfo] = {}
        self.structure: Dict = {}
        self.tree_visual: str = ""
        self.client = None
        self.use_requests = False
        self._init_client()
    
    def _get_project_path(self) -> str:
        print("\n" + "=" * 80)
        print("📂 SAISIE DU CHEMIN DU PROJET")
        print("=" * 80)
        
        while True:
            path_input = input("\n🔗 Entrez le chemin complet du projet:\n>>> ").strip()
            path_input = path_input.strip('"\'')
            test_path = Path(path_input)
            
            if not test_path.exists():
                print(f"❌ Le chemin n'existe pas: {path_input}")
                continue
            if not test_path.is_dir():
                print(f"❌ Ce n'est pas un répertoire: {path_input}")
                continue
            
            print(f"\n✅ Chemin validé: {test_path.absolute()}")
            file_count = len(list(test_path.rglob('*')))
            print(f"📁 Contient environ {file_count} fichiers/dossiers")
            
            confirm = input("\n✅ Analyser ce projet ? (oui/non): ").strip().lower()
            if confirm in ['oui', 'o', 'yes', 'y']:
                return str(test_path)
            print("🔄 Réessayez avec un autre chemin\n")
    
    def _init_client(self):
        try:
            from groq import Groq
            self.client = Groq(api_key=self.groq_api_key)
            print("✅ Utilisation du SDK Groq")
        except Exception:
            print("⚠️  SDK Groq non disponible, utilisation de requests")
            try:
                import requests
                self.use_requests = True
                self.requests = requests
                print("✅ Fallback requests activé")
            except ImportError:
                raise ValueError("❌ requests non installé: pip install requests")
    
    def get_exclude_patterns(self) -> Tuple[Set[str], Set[str]]:
        """🚀 FILTRAGE ULTRA STRICT - venv + site-packages KILL"""
        exclude_dirs = {
            # CRITIQUE
            '.git', '.venv', 'venv', 'env', 'Lib', 'site-packages', '__pycache__',
            'node_modules', 'dist', 'build', '.angular', 'vite', '.cache',
            # Nouveau : VENV complet
            'Lib', 'Scripts', 'Include', 'DLLs', 'pip', 'pip-*', 'setuptools',
            'wheel', 'anyio', 'certifi', 'requests', 'httpx', 'pydantic',
            'fastapi', 'uvicorn', 'groq', 'rich'
        }
        exclude_ext = {'.pyc', '.pyd', '.dist-info', '.egg-info', '.log', '.map'}
        return exclude_dirs, exclude_ext

    def should_skip_file(self, file_path: Path) -> bool:
        """🛡️  SKIP ULTRA STRICT"""
        # 1. Noms dossiers exacts
        if any(skip_dir in file_path.parts for skip_dir in self.get_exclude_patterns()[0]):
            return True
        
        # 2. Contient site-packages ou Lib
        if 'site-packages' in str(file_path).lower() or 'lib' in str(file_path.parts[-2:]):
            return True
        
        # 3. Fichiers venv typiques
        venv_patterns = ['__pycache__', 'dist-info', 'egg-info', 'pip-', 'setuptools']
        if any(p in file_path.name.lower() for p in venv_patterns):
            return True
        
        # 4. Taille < 50 bytes (fichiers vides)
        if file_path.stat().st_size < 50:
            return True
        
        return False

    
    def is_cache_file(self, file_path: Path) -> bool:
        """Détecte les fichiers de cache Angular/Vite/Webpack"""
        name = file_path.name.lower()
        
        # Fichiers cache Angular/Vite
        cache_patterns = [
            'chunk-', '.map', '_metadata.json', 'com.chrome.devtools.json',
            'deps_ssr', '.js.map', '.css.map'
        ]
        
        if any(pattern in name for pattern in cache_patterns):
            return True
        
        # Dossiers cache
        cache_dirs = ['.angular/cache', 'vite', 'webpack']
        for cache_dir in cache_dirs:
            if cache_dir in str(file_path):
                return True
        
        return False
    
    def is_binary_file(self, file_path: Path) -> bool:
        binary_extensions = {
            '.pyc', '.pyo', '.pyd', '.so', '.o', '.a', '.exe', '.dll', 
            '.dylib', '.zip', '.tar', '.gz', '.jpg', '.png', '.jpeg', 
            '.gif', '.ico', '.pdf', '.db', '.sqlite', '.class', '.jar'
        }
        return file_path.suffix.lower() in binary_extensions
    
    def get_file_language(self, file_path: Path) -> str:
        lang_map = {
            '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript', '.jsx': 'JSX',
            '.tsx': 'TSX', '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML',
            '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.md': 'Markdown',
            '.txt': 'Text', '.sh': 'Bash', '.env': 'Environment', '.toml': 'TOML',
            '.xml': 'XML', '.java': 'Java', '.go': 'Go', '.rs': 'Rust',
            '.dockerfile': 'Dockerfile', '.gitignore': 'Git'
        }
        
        name_lower = file_path.name.lower()
        suffix = file_path.suffix.lower()
        return lang_map.get(name_lower, lang_map.get(suffix, 'Unknown'))
    
    def should_skip_file(self, file_path: Path, exclude_dirs: Set[str], exclude_ext: Set[str]) -> bool:
        # Dossiers exclus
        for part in file_path.parts:
            if part in exclude_dirs:
                return True
        
        # Extensions excluses
        if file_path.suffix.lower() in exclude_ext:
            return True
        
        # Fichiers cache Angular/Vite
        if self.is_cache_file(file_path):
            return True
        
        # Fichiers cachés (sauf importants)
        if (file_path.name.startswith('.') and 
            file_path.name not in ['.env', '.gitignore', '.editorconfig']):
            return True
        
        # Fichiers vides ou trop petits
        if file_path.stat().st_size < 10:
            return True
        
        return False
    
    def scan_project(self) -> None:
        exclude_dirs, exclude_ext = self.get_exclude_patterns()
        
        print("🔍 Scan INTELLIGENT du projet (cache filtré)...")
        print(f"   (ignorant {len(exclude_dirs)} dossiers, {len(exclude_ext)} extensions)")
        
        file_count = 0
        skipped_count = 0
        
        for file_path in self.project_root.rglob('*'):
            if not file_path.is_file():
                continue
            
            if self.should_skip_file(file_path, exclude_dirs, exclude_ext):
                skipped_count += 1
                continue
            
            if self.is_binary_file(file_path):
                skipped_count += 1
                continue
            
            try:
                relative_path = file_path.relative_to(self.project_root)
                file_size = file_path.stat().st_size
                
                content_preview = ""
                if file_size < 100000:
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content_preview = f.read(500)
                    except:
                        content_preview = "[Erreur de lecture]"
                else:
                    content_preview = "[Fichier volumineux]"
                
                language = self.get_file_language(file_path)
                
                self.files_data[str(relative_path)] = FileInfo(
                    path=str(relative_path), size=file_size,
                    content_preview=content_preview, language=language
                )
                file_count += 1
            except:
                pass
        
        print(f"✅ {file_count} fichiers importants analysés")
        print(f"⏭️  {skipped_count} fichiers ignorés (cache, binaires, vides)")
    
    def build_structure_tree(self) -> Dict:
        tree = {}
        for file_path in sorted(self.files_data.keys()):
            parts = file_path.split(os.sep)
            current = tree
            for part in parts[:-1]:
                if part not in current:
                    current[part] = {}
                current = current[part]
            current[parts[-1]] = {
                "size": self.files_data[file_path].size,
                "lang": self.files_data[file_path].language,
                "type": "file"
            }
        self.structure = tree
        return tree
    
    def generate_tree_visual(self, tree: Dict = None, prefix: str = "", 
                           is_last: bool = True, max_depth: int = 6) -> str:
        if tree is None:
            tree = self.structure
        if not tree:
            return "Aucune structure trouvée"
        
        lines = []
        items = sorted(tree.items())
        
        for i, (name, content) in enumerate(items):
            is_last_item = (i == len(items) - 1)
            current_prefix = "└── " if is_last_item else "├── "
            
            if isinstance(content, dict) and content.get("type") != "file":
                lines.append(f"{prefix}{current_prefix}📁 {name}")
                extension = "    " if is_last_item else "│   "
                sub_tree = self.generate_tree_visual(
                    content, prefix + extension, is_last_item, max_depth - 1
                )
                lines.append(sub_tree)
            else:
                size = content.get("size", 0)
                lang = content.get("lang", "Unknown")
                size_str = f"{size/1024:.1f} KB" if size > 1024 else f"{size} bytes"
                lines.append(f"{prefix}{current_prefix}📄 {name} ({lang} - {size_str})")
        
        return "\n".join(lines)
    
    def analyze_with_groq(self, prompt: str, max_retries: int = 3) -> str:
        """Analyse avec rate limiting et retry intelligent"""
        time.sleep(0.5)  # Rate limiting
        
        if self.use_requests:
            # Implémentation requests avec retry
            return "[Analyse via requests - implémentation simplifiée]"
        
        for attempt in range(max_retries):
            try:
                message = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "Expert architecture logicielle. Concis, français."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=800,
                )
                return message.choices[0].message.content
            except Exception as e:
                if "429" in str(e):
                    print(f"⏳ Rate limit, attente 2s (tentative {attempt+1}/{max_retries})")
                    time.sleep(2 ** attempt)
                    continue
                return f"[Erreur: {str(e)[:50]}]"
        
        return "[API indisponible]"
    
    def analyze_dependencies(self) -> Dict:
        print("\n📦 Analyse des dépendances...")
        deps_info = {}
        dep_files = ['package.json', 'requirements.txt', 'pom.xml', 'pyproject.toml']
        
        for file_path in self.files_data:
            if any(file_path.endswith(dep) for dep in dep_files):
                content = self.files_data[file_path].content_preview[:1000]
                prompt = f"Analyse ce fichier de dépendances:\n{file_path}\n{content}\n\n1. Dépendances principales\n2. Problèmes\n3. Manquantes"
                analysis = self.analyze_with_groq(prompt)
                deps_info[file_path] = analysis
        
        return deps_info
    
    def analyze_files_purpose(self) -> Dict:
        print("\n📄 Analyse des fichiers importants...")
        important_ext = ['.py', '.js', '.ts', '.java', '.json', '.yaml', '.md']
        important_files = [f for f in self.files_data if 
                          any(f.lower().endswith(ext) for ext in important_ext)][:20]
        
        results = {}
        for i, file_path in enumerate(important_files, 1):
            print(f"  {i}/20: {file_path}")
            content = self.files_data[file_path].content_preview[:400]
            prompt = f"Explique en 2 phrases le rôle de:\n{file_path}\n{self.files_data[file_path].language}\n{content}"
            results[file_path] = self.analyze_with_groq(prompt)
        
        return results
    
    def get_improvement_suggestions(self) -> str:
        print("\n💡 Suggestions d'amélioration...")
        langs = set(f.language for f in self.files_data.values())
        summary = "\n".join([f"• {k} ({v.language})" for k, v in list(self.files_data.items())[:15]])
        
        prompt = f"""5 améliorations prioritaires pour ce projet:
Langages: {', '.join(langs)}
Fichiers: {len(self.files_data)}
{summary}

Format: 1. Problème | Solution | Impact"""
        return self.analyze_with_groq(prompt)
    
    def generate_report(self) -> str:
        report = []
        report.extend([
            "=" * 80,
            "📊 RAPPORT D'ANALYSE DE PROJET - Agent IA Groq (PROPRE)",
            "=" * 80,
            f"📁 Projet: {self.project_root.absolute()}",
            f"📈 Fichiers analysés: {len(self.files_data)}",
            f"🤖 Modèle: {self.model}",
            ""
        ])
        
        # 1. Arbre visuel
        report.extend([
            "1️⃣  ARBRE VISUEL (PROPRE - Cache filtré)",
            "-" * 40,
            f"📦 {self.project_root.name}",
            self.generate_tree_visual(),
            ""
        ])
        
        # 2. Fichiers importants
        report.extend([
            "2️⃣  ANALYSE DES FICHIERS IMPORTANTS",
            "-" * 40
        ])
        files_analysis = self.analyze_files_purpose()
        for file_path, analysis in list(files_analysis.items())[:15]:
            report.extend([f"\n📝 {file_path}", analysis])
        report.append("")
        
        # 3. Dépendances
        report.extend(["3️⃣  DÉPENDANCES", "-" * 40])
        deps = self.analyze_dependencies()
        for dep_file, analysis in deps.items():
            report.extend([f"\n📦 {dep_file}", analysis])
        report.append("")
        
        # 4. Suggestions
        report.extend([
            "4️⃣  SUGGESTIONS D'AMÉLIORATION",
            "-" * 40,
            self.get_improvement_suggestions(),
            ""
        ])
        
        # 5. Stats
        report.extend([
            "5️⃣  STATISTIQUES",
            "-" * 40
        ])
        lang_counts = {}
        for f in self.files_data.values():
            lang_counts[f.language] = lang_counts.get(f.language, 0) + 1
        
        total_size = sum(f.size for f in self.files_data.values())
        report.extend([
            f"Taille: {total_size/1024:.1f} KB",
            f"Fichiers: {len(self.files_data)}",
            "Langages:",
            "\n".join(f"  • {lang}: {count}" for lang, count in 
                     sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)),
            "",
            "=" * 80, "✅ Analyse PROPRE complétée!", "=" * 80
        ])
        
        return "\n".join(report)
    
    def run(self) -> None:
        try:
            print("🚀 Agent IA PROPRE démarré...")
            self.scan_project()
            self.build_structure_tree()
            
            report = self.generate_report()
            print("\n" + report)
            
            report_path = self.project_root / "project_analysis_CLEAN.txt"
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"\n💾 Rapport PROPRE: {report_path}")
            
        except KeyboardInterrupt:
            print("\n⚠️  Interrompu")
            sys.exit(0)
        except Exception as e:
            print(f"❌ Erreur: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

def main():
    print("""
╔══════════════════════════════════════════════════════════╗
║       🤖 AGENT IA PROPRE - CACHE FILTRÉ                 ║
║              Arbre parfait + Rate limiting               ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    try:
        project_path = sys.argv[1] if len(sys.argv) > 1 else None
        analyzer = ProjectAnalyzer(project_path)
        analyzer.run()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
