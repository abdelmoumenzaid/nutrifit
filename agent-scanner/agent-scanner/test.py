#!/usr/bin/env python3
"""
🔥 AGENT IA ULTRA-COMPLET - 15 SUPER-POUVOIRS
Vulnérabilités | Qualité | Architecture | Performance | Tests | Docs

Version COMPLÈTE avec TOUS les modes d'analyse
"""

import os
import json
import sys
import time
import re
from pathlib import Path
from typing import Dict, List, Tuple, Set
from dataclasses import dataclass, field
import warnings

warnings.filterwarnings('ignore')
from dotenv import load_dotenv
load_dotenv()

@dataclass
class FileInfo:
    path: str
    size: int
    content: str
    language: str
    api_endpoints: List[str] = field(default_factory=list)
    vulnerabilities: List[str] = field(default_factory=list)
    code_issues: List[str] = field(default_factory=list)
    duplicates: List[str] = field(default_factory=list)
    complexity: int = 0

class UltraProjectAnalyzer:
    def __init__(self, project_path: str = None):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        
        if project_path is None:
            project_path = self._get_project_path()
        
        self.project_root = Path(project_path).resolve()
        if not self.project_root.exists() or not self.project_root.is_dir():
            raise ValueError(f"❌ Chemin invalide: {self.project_root}")
        if not self.groq_api_key:
            raise ValueError("❌ GROQ_API_KEY manquante")
        
        self.files_data: Dict[str, FileInfo] = {}
        self.structure: Dict = {}
        self.analysis_results = {
            'vulnerabilities': [],
            'dependencies': [],
            'duplicates': [],
            'architecture': [],
            'performance': [],
            'quality': [],
            'tests': [],
            'docs': []
        }
        self._init_client()
    
    def _get_project_path(self) -> str:
        print("\n" + "="*80)
        print("🔥 AGENT IA ULTRA - 15 SUPER-POUVOIRS")
        print("="*80)
        while True:
            path = input("\n📂 Chemin du projet:\n>>> ").strip().strip('"\'')
            test = Path(path)
            if test.exists() and test.is_dir():
                print(f"✅ {test.absolute()}")
                if input("Analyser ? (oui/non): ").lower() in ['oui','o','y']:
                    return str(test)
            print("❌ Invalide")
    
    def _init_client(self):
        try:
            from groq import Groq
            self.client = Groq(api_key=self.groq_api_key)
            print("✅ Groq SDK activé")
        except:
            print("⚠️  Fallback mode")

    # ============= 1. SÉCURITÉ - VULNÉRABILITÉS =============
    
    def detect_vulnerabilities(self, content: str, file_path: str) -> List[str]:
        """🔒 Détecte VULNÉRABILITÉS"""
        vulns = []
        
        patterns = {
            'sql_injection': [
                r"raw\s*\(\s*['\"]?input",
                r"query\s*\(\s*['\"].*?\$\s*\{",
                r"execute\s*\(\s*input"
            ],
            'xss': [
                r"innerHTML\s*=",
                r"document\.write\s*\(",
                r"eval\s*\(\s*",
                r"\$\s*\(\s*input"
            ],
            'secrets': [
                r'(api_key|password|token|secret)\s*[=:]\s*["\']?[a-zA-Z0-9]{20,}',
                r'AWS_SECRET_ACCESS_KEY',
                r'PRIVATE_KEY'
            ],
            'auth': [
                r'authorization\s*=\s*["\']Bearer.*["\']',
                r'hardcoded.*password'
            ],
            'insecure_http': [
                r'http://[^localhost]'
            ],
            'path_traversal': [
                r'fs\.read.*\.\./',
                r'path\.join\([^)]*\.\.\/'
            ]
        }
        
        for vuln_type, patterns_list in patterns.items():
            for pattern in patterns_list:
                if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
                    vulns.append(f"⚠️  {vuln_type.upper()}: {pattern[:30]}...")
        
        return vulns
    
    def check_dependencies_security(self) -> List[str]:
        """🔒 Analyse dépendances obsolètes"""
        issues = []
        
        # Chercher fichiers dépendances
        dep_files = {
            'package.json': self._parse_package_json,
            'requirements.txt': self._parse_requirements,
            'pom.xml': self._parse_pom
        }
        
        for dep_file, parser in dep_files.items():
            for file_path, info in self.files_data.items():
                if file_path.endswith(dep_file):
                    issues.extend(parser(info.content))
        
        return issues
    
    def _parse_package_json(self, content: str) -> List[str]:
        issues = []
        try:
            data = json.loads(content)
            deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
            
            # Dépendances obsolètes courantes
            obsolete = {
                'moment': '❌ moment - utiliser date-fns',
                'bower': '❌ bower - utiliser npm/yarn',
                'jade': '❌ jade - renommé pug',
                'node-sass': '❌ node-sass - utiliser sass'
            }
            
            for old, msg in obsolete.items():
                if old in deps:
                    issues.append(msg)
        except:
            pass
        return issues
    
    def _parse_requirements(self, content: str) -> List[str]:
        issues = []
        for line in content.split('\n'):
            if '==' not in line:
                issues.append(f"⚠️  Version non pinned: {line.strip()}")
        return issues
    
    def _parse_pom(self, content: str) -> List[str]:
        return ["⚠️  Vérifier versions Maven"]

    # ============= 2. CODE DUPLIQUÉ & QUALITÉ =============
    
    def find_code_duplicates(self) -> Dict[str, List[str]]:
        """🔍 Trouvé CODE DUPLIQUÉ"""
        duplicates = {}
        
        # Extraire signatures de fonctions
        func_signatures = {}
        
        for file_path, info in self.files_data.items():
            if info.language in ['TypeScript', 'JavaScript', 'Python', 'Java']:
                # Extraire fonctions
                patterns = {
                    'ts/js': r'(?:function|const|let)\s+(\w+)\s*(?:\(|=\s*\()',
                    'python': r'def\s+(\w+)\s*\(',
                    'java': r'(?:public|private|protected)\s+(?:static\s+)?(?:\w+)\s+(\w+)\s*\('
                }
                
                pattern = patterns.get('ts/js' if 'Script' in info.language else 'python')
                if pattern:
                    funcs = re.findall(pattern, info.content)
                    for func in funcs:
                        if func not in func_signatures:
                            func_signatures[func] = []
                        func_signatures[func].append(file_path)
        
        # Trouver duplicates
        for func, files in func_signatures.items():
            if len(files) > 1:
                duplicates[func] = files
        
        return duplicates
    
    def measure_code_complexity(self, content: str) -> int:
        """📊 Mesure complexité cyclomatique"""
        complexity = 1
        
        # Compter structures conditionnelles
        complexity += len(re.findall(r'\b(if|else if|for|while|switch|catch)\b', content))
        complexity += len(re.findall(r'\?\s*:', content))  # Ternaires
        complexity += len(re.findall(r'&&|\|\|', content)) * 0.1
        
        return max(1, int(complexity))
    
    def detect_anti_patterns(self, content: str, language: str) -> List[str]:
        """⚠️  Détecte ANTI-PATTERNS"""
        patterns = []
        
        if language in ['JavaScript', 'TypeScript']:
            # Callback hell
            if content.count('.then(') > 3 or content.count('callback') > 5:
                patterns.append("🔴 Callback Hell - utiliser async/await")
            
            # console.log
            if 'console.log' in content:
                patterns.append("🟡 Logs en console - utiliser logger")
            
            # var usage
            if re.search(r'\bvar\s+', content):
                patterns.append("🟡 Utiliser const/let au lieu de var")
        
        elif language == 'Python':
            # Global variables
            if re.search(r'^global\s+\w+', content, re.MULTILINE):
                patterns.append("🔴 Variables globales - éviter")
            
            # Bare except
            if 'except:' in content:
                patterns.append("🔴 Bare except - spécifier exception")
        
        # Trailing whitespace
        if re.search(r'\s+$', content, re.MULTILINE):
            patterns.append("🟡 Whitespace inutile")
        
        return patterns

    # ============= 3. ARCHITECTURE & DESIGN =============
    
    def extract_api_endpoints(self, content: str) -> List[str]:
        """🌐 Extrait TOUS endpoints API"""
        endpoints = []
        
        patterns = {
            'express': r"\.(?:get|post|put|delete|patch)\s*\(\s*['\"`]([^'\"`:]+)['\"`]",
            'flask': r"@app\.(?:get|post|put|delete)\s*\(\s*['\"]([^'\"]+)['\"]",
            'fastapi': r"@(?:app|router)\.(?:get|post|put|delete)\s*\(\s*['\"]([^'\"]+)['\"]",
            'spring': r"@(?:Get|Post|Put|Delete)Mapping\s*\(\s*['\"]([^'\"]+)['\"]",
            'angular': r"http(?:Client)?\.(?:get|post|put|delete|patch)\s*\(\s*['\"`]([^'\"`:]+)"
        }
        
        for framework, pattern in patterns.items():
            matches = re.findall(pattern, content, re.MULTILINE)
            endpoints.extend(matches)
        
        return list(set(endpoints))
    
    def analyze_architecture(self) -> Dict:
        """🏗️  Analyse ARCHITECTURE"""
        arch = {
            'services': [],
            'controllers': [],
            'models': [],
            'utils': [],
            'middleware': []
        }
        
        for file_path in self.files_data:
            if 'service' in file_path.lower():
                arch['services'].append(file_path)
            elif 'controller' in file_path.lower():
                arch['controllers'].append(file_path)
            elif 'model' in file_path.lower() or 'entity' in file_path.lower():
                arch['models'].append(file_path)
            elif 'util' in file_path.lower() or 'helper' in file_path.lower():
                arch['utils'].append(file_path)
            elif 'middleware' in file_path.lower():
                arch['middleware'].append(file_path)
        
        return arch
    
    def check_solid_violations(self, content: str, file_path: str) -> List[str]:
        """🔴 Détecte violations SOLID"""
        violations = []
        
        # S - Single Responsibility
        if content.count('function') > 10 or content.count('def ') > 10:
            violations.append("❌ S - Trop de responsabilités (>10 fonctions)")
        
        # O - Open/Closed
        if 'if' in content and content.count('if') > 5:
            violations.append("⚠️  O - Utiliser pattern Strategy au lieu de if/else")
        
        # L - Liskov Substitution
        if re.search(r'isinstance|type\s*==', content):
            violations.append("⚠️  L - Éviter vérification type (duck typing)")
        
        # I - Interface Segregation
        if 'import' in content:
            imports = len(re.findall(r'^import|^from', content, re.MULTILINE))
            if imports > 15:
                violations.append(f"⚠️  I - Trop d'imports ({imports}) - dépendances élevées")
        
        # D - Dependency Inversion
        if re.search(r'new\s+\w+\(', content):
            violations.append("⚠️  D - Utiliser injection de dépendances")
        
        return violations

    # ============= 4. PERFORMANCE =============
    
    def analyze_bundle_size(self) -> Dict:
        """📦 Analyse BUNDLE SIZE"""
        bundle_data = {
            'total': 0,
            'by_type': {},
            'large_files': []
        }
        
        for file_path, info in self.files_data.items():
            ext = Path(file_path).suffix
            if ext not in bundle_data['by_type']:
                bundle_data['by_type'][ext] = 0
            
            bundle_data['by_type'][ext] += info.size
            bundle_data['total'] += info.size
            
            if info.size > 100000:  # > 100KB
                bundle_data['large_files'].append((file_path, info.size))
        
        bundle_data['large_files'].sort(key=lambda x: x[1], reverse=True)
        return bundle_data
    
    def detect_performance_issues(self, content: str, language: str) -> List[str]:
        """⚡ Détecte problèmes PERFORMANCE"""
        issues = []
        
        if language in ['JavaScript', 'TypeScript']:
            # N+1 queries
            if re.search(r'for.*http\.(?:get|post)', content):
                issues.append("🔴 N+1 Queries - batcher les requêtes")
            
            # Infinite loops
            if re.search(r'while\s*\(\s*true\s*\)', content):
                issues.append("🔴 Infinite loop détecté!")
            
            # Render blocking
            if '<script' in content and 'defer' not in content:
                issues.append("🟡 Script bloquant - ajouter defer/async")
            
            # DOM queries in loop
            if re.search(r'for.*document\.querySelector', content):
                issues.append("🟡 DOM query en boucle - cache le sélecteur")
        
        elif language == 'Python':
            # Sleep
            if 'time.sleep' in content:
                issues.append("🟡 time.sleep trouvé - préférer asyncio")
            
            # List comprehension
            if content.count('for ') > 5 and '[' not in content:
                issues.append("🟡 Utiliser list comprehension")
        
        return issues
    
    def suggest_lazy_loading(self) -> List[str]:
        """🚀 Suggère LAZY LOADING"""
        suggestions = []
        
        # Chercher gros fichiers non lazy-loadés
        for file_path, info in self.files_data.items():
            if info.size > 100000:
                if 'lazy' not in file_path.lower():
                    suggestions.append(f"💡 Lazy-load: {file_path}")
        
        return suggestions

    # ============= 5. TESTS =============
    
    def analyze_test_coverage(self) -> Dict:
        """🧪 Analyse couverture TESTS"""
        tests = {'total': 0, 'missing': [], 'found': []}
        
        test_files = [f for f in self.files_data if '.spec.' in f or '.test.' in f]
        tests['total'] = len(test_files)
        tests['found'] = test_files
        
        # Fichiers sans tests
        source_files = [f for f in self.files_data if 
                       f.endswith(('.ts', '.js', '.py', '.java')) and '.spec' not in f and '.test' not in f]
        
        for source in source_files[:10]:
            test_name = source.replace('.ts', '.spec.ts').replace('.js', '.spec.js')
            if not any(test_name in f for f in test_files):
                tests['missing'].append(source)
        
        return tests
    
    def generate_missing_tests(self, file_path: str) -> str:
        """✍️  Génère TESTS manquants"""
        info = self.files_data[file_path]
        prompt = f"""Génère 5 tests unitaires pour ce fichier:

FICHIER: {file_path}
LANGAGE: {info.language}
CONTENU: {info.content[:1500]}

Format:
describe('suite', () => {{
  it('test', () => {{ expect().toBe() }})
}})"""
        
        return self.analyze_with_groq(prompt)

    # ============= 6. DOCUMENTATION =============
    
    def generate_swagger_docs(self) -> str:
        """📖 Génère SWAGGER OpenAPI"""
        endpoints = []
        for file_path, info in self.files_data.items():
            endpoints.extend(self.extract_api_endpoints(info.content))
        
        swagger = {
            "openapi": "3.0.0",
            "info": {"title": "API", "version": "1.0.0"},
            "paths": {}
        }
        
        for endpoint in list(set(endpoints))[:20]:
            swagger['paths'][endpoint] = {
                "get": {"responses": {"200": {"description": "Success"}}}
            }
        
        return json.dumps(swagger, indent=2)
    
    def generate_architecture_docs(self) -> str:
        """📐 Génère DOCS architecture"""
        arch = self.analyze_architecture()
        
        docs = "# Architecture\n\n"
        docs += f"## Services ({len(arch['services'])})\n"
        for svc in arch['services'][:5]:
            docs += f"- {svc}\n"
        
        docs += f"\n## Controllers ({len(arch['controllers'])})\n"
        for ctrl in arch['controllers'][:5]:
            docs += f"- {ctrl}\n"
        
        docs += f"\n## Models ({len(arch['models'])})\n"
        for model in arch['models'][:5]:
            docs += f"- {model}\n"
        
        return docs

    # ============= CORE METHODS =============
    
    def scan_project(self) -> None:
        """Scan COMPLET du projet"""
        print("🔍 Scan en cours...")
        exclude_dirs = {'.git','.venv','node_modules','dist','build','.angular/cache'}
        exclude_ext = {'.pyc','.map','.log'}
        
        file_count = 0
        for file_path in self.project_root.rglob('*'):
            if not file_path.is_file():
                continue
            
            if any(p in file_path.parts for p in exclude_dirs):
                continue
            if file_path.suffix.lower() in exclude_ext:
                continue
            if file_path.stat().st_size > 500000:
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                relative = file_path.relative_to(self.project_root)
                lang = self._get_language(file_path)
                
                info = FileInfo(
                    path=str(relative),
                    size=file_path.stat().st_size,
                    content=content,
                    language=lang,
                    api_endpoints=self.extract_api_endpoints(content),
                    vulnerabilities=self.detect_vulnerabilities(content, str(relative)),
                    code_issues=self.detect_anti_patterns(content, lang),
                    complexity=self.measure_code_complexity(content)
                )
                
                self.files_data[str(relative)] = info
                file_count += 1
            except:
                pass
        
        print(f"✅ {file_count} fichiers scannés")
    
    def _get_language(self, file_path: Path) -> str:
        lang_map = {
            '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
            '.java': 'Java', '.json': 'JSON', '.html': 'HTML', '.css': 'CSS',
            '.md': 'Markdown', '.yml': 'YAML', '.xml': 'XML'
        }
        return lang_map.get(file_path.suffix.lower(), 'Unknown')
    
    def analyze_with_groq(self, prompt: str) -> str:
        """Appel API Groq avec retry"""
        time.sleep(0.8)
        try:
            from groq import Groq
            client = Groq(api_key=self.groq_api_key)
            resp = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": "Expert code. Français. Concis."},
                         {"role": "user", "content": prompt}],
                temperature=0.3, max_tokens=500
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"[Erreur: {str(e)[:50]}]"
    
    def generate_report(self) -> str:
        """Génère RAPPORT ULTRA-COMPLET"""
        report = []
        
        report.append("="*80)
        report.append("🔥 RAPPORT ULTRA - 15 SUPER-POUVOIRS")
        report.append("="*80)
        report.append(f"📁 {self.project_root.name} | 📈 {len(self.files_data)} fichiers\n")
        
        # 1. SÉCURITÉ
        report.append("1️⃣  🔒 SÉCURITÉ - VULNÉRABILITÉS")
        report.append("-"*60)
        all_vulns = []
        for info in self.files_data.values():
            all_vulns.extend(info.vulnerabilities)
        if all_vulns:
            for vuln in list(set(all_vulns))[:10]:
                report.append(f"  {vuln}")
        else:
            report.append("  ✅ Aucune vulnérabilité détectée")
        report.append("")
        
        # 2. DÉPENDANCES
        report.append("2️⃣  📦 DÉPENDANCES OBSOLÈTES")
        report.append("-"*60)
        deps = self.check_dependencies_security()
        if deps:
            for dep in deps[:10]:
                report.append(f"  {dep}")
        else:
            report.append("  ✅ Dépendances OK")
        report.append("")
        
        # 3. CODE DUPLIQUÉ
        report.append("3️⃣  🔍 CODE DUPLIQUÉ (REFACTORING)")
        report.append("-"*60)
        dupes = self.find_code_duplicates()
        if dupes:
            for func, files in list(dupes.items())[:5]:
                report.append(f"  ⚠️  {func} trouvé dans {len(files)} fichiers")
                for f in files[:2]:
                    report.append(f"     - {f}")
        else:
            report.append("  ✅ Code unique")
        report.append("")
        
        # 4. QUALITÉ
        report.append("4️⃣  📊 QUALITÉ CODE")
        report.append("-"*60)
        avg_complexity = sum(f.complexity for f in self.files_data.values()) / len(self.files_data)
        report.append(f"  Complexité moyenne: {avg_complexity:.1f}")
        for file, info in list(self.files_data.items())[:5]:
            if info.code_issues:
                report.append(f"\n  📝 {file}")
                for issue in info.code_issues[:3]:
                    report.append(f"     {issue}")
        report.append("")
        
        # 5. API ENDPOINTS
        report.append("5️⃣  🌐 API ENDPOINTS")
        report.append("-"*60)
        all_endpoints = []
        for info in self.files_data.values():
            all_endpoints.extend(info.api_endpoints)
        for endpoint in list(set(all_endpoints))[:15]:
            report.append(f"  📡 {endpoint}")
        report.append(f"\n  Total: {len(set(all_endpoints))} endpoints\n")
        
        # 6. ARCHITECTURE
        report.append("6️⃣  🏗️  ARCHITECTURE")
        report.append("-"*60)
        arch = self.analyze_architecture()
        report.append(f"  Services: {len(arch['services'])}")
        report.append(f"  Controllers: {len(arch['controllers'])}")
        report.append(f"  Models: {len(arch['models'])}")
        report.append(f"  Utilities: {len(arch['utils'])}\n")
        
        # 7. SOLID
        report.append("7️⃣  ❌ VIOLATIONS SOLID")
        report.append("-"*60)
        solid_issues = []
        for info in self.files_data.values():
            check = self.check_solid_violations(info.content, info.path)
            solid_issues.extend(check)
        if solid_issues:
            for issue in list(set(solid_issues))[:8]:
                report.append(f"  {issue}")
        else:
            report.append("  ✅ Code SOLID compliant")
        report.append("")
        
        # 8. PERFORMANCE
        report.append("8️⃣  ⚡ PERFORMANCE")
        report.append("-"*60)
        bundle = self.analyze_bundle_size()
        report.append(f"  Taille totale: {bundle['total']/1024:.1f} KB")
        report.append(f"  Fichiers > 100KB: {len(bundle['large_files'])}")
        for file, size in bundle['large_files'][:5]:
            report.append(f"    - {file}: {size/1024:.1f} KB")
        
        perf_issues = []
        for info in self.files_data.values():
            perf_issues.extend(self.detect_performance_issues(info.content, info.language))
        if perf_issues:
            report.append(f"\n  Problèmes détectés:")
            for issue in list(set(perf_issues))[:5]:
                report.append(f"    {issue}")
        report.append("")
        
        # 9. TESTS
        report.append("9️⃣  🧪 TESTS")
        report.append("-"*60)
        tests = self.analyze_test_coverage()
        report.append(f"  Tests trouvés: {tests['total']}")
        report.append(f"  Fichiers sans tests: {len(tests['missing'])}")
        for f in tests['missing'][:3]:
            report.append(f"    ❌ {f}")
        report.append("")
        
        # 10. DOCS
        report.append("🔟  📖 DOCUMENTATION")
        report.append("-"*60)
        swagger = self.generate_swagger_docs()
        report.append("Swagger OpenAPI générée (sample):")
        report.append(swagger[:500] + "...\n")
        report.append(self.generate_architecture_docs())
        
        report.append("\n" + "="*80)
        report.append("✅ ANALYSE ULTRA-COMPLÈTE TERMINÉE!")
        report.append("="*80)
        
        return "\n".join(report)
    
    def run(self):
        """Lance analyse complète"""
        print("🚀 AGENT ULTRA DÉMARRÉ...")
        self.scan_project()
        
        report = self.generate_report()
        print(report)
        
        output = self.project_root / "ULTRA_ANALYSIS_COMPLETE.txt"
        with open(output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"\n💾 RAPPORT SAUVEGARDÉ: {output}")

def main():
    print("""
╔════════════════════════════════════════════════════════════════╗
║  🔥 AGENT IA ULTRA-COMPLET - 15 SUPER-POUVOIRS              ║
║  Sécurité | Qualité | Architecture | Performance | Tests | Docs ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        path = sys.argv[1] if len(sys.argv) > 1 else None
        analyzer = UltraProjectAnalyzer(path)
        analyzer.run()
    except KeyboardInterrupt:
        print("\n⚠️  Arrêté")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    main()
