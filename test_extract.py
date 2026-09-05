from etl.extract.csv_reader import load_all_csv_files


data = load_all_csv_files()

for name, df in data.items():
    print(f"{name}: {len(df)} records")