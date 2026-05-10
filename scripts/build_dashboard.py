import os
import subprocess
import sys

def run_command(command, description):
    print(f"🚀 {description}...")
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"✅ {description} sukses!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Gagal: {description}. Error: {e}")

def main():
    print("🛠 --- ARMEDIA MASTER REBUILD --- 🛠")
    
    # 1. Clean data cache
    if os.path.exists('public/data/dummy_data.js'):
        os.remove('public/data/dummy_data.js')
        print("🧹 Cache dummy_data.js dibersihkan.")

    # 2. Run Link Local to fetch fresh data
    run_command("python3 scripts/link_local.py", "Sinkronisasi data dari spreadsheet")

    # 3. Build registration form (Vite)
    if os.path.exists('package.json'):
        run_command("npm run build", "Membangun (Build) Registrasi Form")
    else:
        print("⚠️ package.json tidak ditemukan, skip build.")

    print("\n✨ REBUILD SELESAI! ✨")
    print("Dashboard: public/dashboard.html (Ready with local cache)")
    print("Form: dist/index.html (Production ready)")
    print("\nJalankan 'npm run dev' untuk mulai development.")

if __name__ == "__main__":
    main()
