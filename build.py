import os
import shutil

# --- 설정 ---
# 빌드 결과물이 저장될 폴더 이름
DIST_DIR = 'dist'

# 복사할 정적 파일 및 폴더 목록
STATIC_FILES = ['style.css', 'assets']

# 변수 치환을 수행할 템플릿 파일 목록
TEMPLATE_FILES = ['index.html', 'script.js']

# --- 빌드 시작 ---

# 1. 기존 빌드 폴더가 있다면 삭제하고 새로 생성
if os.path.exists(DIST_DIR):
    shutil.rmtree(DIST_DIR)
os.makedirs(DIST_DIR)

# 2. 템플릿 파일들의 내용을 읽고, 환경 변수로 치환하여 dist 폴더에 저장
for filename in TEMPLATE_FILES:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 파일 내용에서 ${VAR} 형식의 모든 변수를 실제 환경 변수 값으로 교체
    # 해당하는 환경 변수가 없으면 빈 문자열로 대체하여 오류 방지
    for key, value in os.environ.items():
        content = content.replace(f'${{{key}}}', value)

    with open(os.path.join(DIST_DIR, filename), 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Processed template: {filename} -> {os.path.join(DIST_DIR, filename)}")

# 3. 정적 파일 및 폴더를 dist 폴더로 복사
for path in STATIC_FILES:
    if os.path.isdir(path):
        shutil.copytree(path, os.path.join(DIST_DIR, os.path.basename(path)))
    else:
        shutil.copy2(path, DIST_DIR)
    print(f"Copied static path: {path} -> {DIST_DIR}")

print("\nBuild process completed successfully.")
