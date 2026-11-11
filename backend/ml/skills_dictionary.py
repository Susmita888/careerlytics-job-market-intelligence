
"""Canonical skills, their categories and aliases.

Extend this dictionary as new skills are found in the job-market dataset.

Format:
canonical_name: (category, [aliases])
"""

# canonical name -> (category, [aliases])
SKILLS: dict[str, tuple[str, list[str]]] = {
    # =========================
    # Programming Languages
    # =========================
    "Python": ("language", ["python3", "py"]),
    "Java": ("language", []),
    "JavaScript": ("language", ["js", "ecmascript"]),
    "TypeScript": ("language", []),
    "C": ("language", []),
    "C++": ("language", ["cpp"]),
    "C#": ("language", ["c sharp"]),
    "Go": ("language", ["golang"]),
    "R": ("language", ["r programming", "rstudio"]),
    "Scala": ("language", []),
    "Bash": ("language", ["shell scripting"]),
    "PHP": ("language", []),
    "Ruby": ("language", []),
    "Kotlin": ("language", []),
    "Swift": ("language", []),
    "Embedded C": ("language", []),
    "Verilog": ("language", ["system verilog"]),
    "VHDL": ("language", []),

    # =========================
    # Data Science and Analytics
    # =========================
    "Pandas": ("data", []),
    "NumPy": ("data", []),
    "Matplotlib": ("data", []),
    "Seaborn": ("data", []),
    "Plotly": ("data", []),
    "Excel": ("data", ["ms excel", "microsoft excel"]),
    "Power BI": ("data", ["powerbi"]),
    "Tableau": ("data", []),
    "Statistics": ("ml", ["statistical analysis", "hypothesis testing"]),
    "Financial Analysis": ("finance", [
        "financial planning and analysis",
        "financial reporting"
    ]),

    # =========================
    # Machine Learning and AI
    # =========================
    "Machine Learning": ("ml", ["ml"]),
    "Deep Learning": ("ml", ["neural networks"]),
    "NLP": ("ml", ["natural language processing"]),
    "Computer Vision": ("ml", ["opencv"]),
    "Scikit-learn": ("ml", ["sklearn", "scikit learn"]),
    "TensorFlow": ("ml", []),
    "PyTorch": ("ml", []),
    "Keras": ("ml", []),
    "Hugging Face": ("ml", ["huggingface"]),
    "LLM": ("ml", ["large language models", "llms"]),
    "Generative AI": ("ml", ["genai", "generative artificial intelligence"]),
    "MLOps": ("ml", ["mlflow"]),
    "Computer Vision Models": ("ml", []),

    # =========================
    # Backend Development
    # =========================
    "FastAPI": ("backend", []),
    "Django": ("backend", []),
    "Flask": ("backend", []),
    "REST API": ("backend", ["rest apis", "restful api", "restful apis"]),
    "GraphQL": ("backend", []),
    "Node.js": ("backend", ["nodejs", "node js"]),
    "Spring Boot": ("backend", ["springboot"]),
    "Microservices": ("backend", []),
    "API Development": ("backend", []),

    # =========================
    # Frontend Development
    # =========================
    "React": ("frontend", ["reactjs", "react.js"]),
    "Angular": ("frontend", ["angularjs"]),
    "Vue": ("frontend", ["vue.js", "vuejs"]),
    "HTML": ("frontend", ["html5"]),
    "CSS": ("frontend", ["css3"]),
    "Tailwind CSS": ("frontend", ["tailwind"]),

    # =========================
    # Databases
    # =========================
    "SQL": ("database", ["structured query language", "t-sql", "pl/sql"]),
    "PostgreSQL": ("database", ["postgres"]),
    "MySQL": ("database", []),
    "MongoDB": ("database", ["mongo"]),
    "Redis": ("database", []),
    "SQLite": ("database", []),
    "Elasticsearch": ("database", []),
    "Oracle Database": ("database", ["oracle db"]),

    # =========================
    # Data Engineering
    # =========================
    "Snowflake": ("data-eng", []),
    "BigQuery": ("data-eng", []),
    "Spark": ("data-eng", ["pyspark", "apache spark"]),
    "Hadoop": ("data-eng", []),
    "Kafka": ("data-eng", ["apache kafka"]),
    "Airflow": ("data-eng", ["apache airflow"]),
    "dbt": ("data-eng", []),
    "ETL": ("data-eng", ["etl pipelines", "elt"]),
    "Data Warehousing": ("data-eng", ["data warehouse"]),

    # =========================
    # DevOps and Cloud
    # =========================
    "Docker": ("devops", []),
    "Kubernetes": ("devops", ["k8s"]),
    "Git": ("devops", []),
    "CI/CD": ("devops", ["cicd", "continuous integration", "continuous deployment"]),
    "Linux": ("devops", []),
    "Terraform": ("devops", []),
    "Jenkins": ("devops", []),
    "GitHub Actions": ("devops", []),
    "AWS": ("cloud", ["amazon web services"]),
    "Azure": ("cloud", ["microsoft azure"]),
    "GCP": ("cloud", ["google cloud", "google cloud platform"]),

    # =========================
    # Testing and Quality
    # =========================
    "Pytest": ("testing", []),
    "Unit Testing": ("testing", []),
    "Software Testing": ("testing", []),
    "Agile": ("other", ["scrum"]),

    # =========================
    # Embedded Systems and Hardware
    # =========================
    "Embedded Systems": ("embedded", ["embedded system"]),
    "Firmware": ("embedded", ["firmware development"]),
    "RTOS": ("embedded", ["real time operating system"]),
    "IoT": ("embedded", ["internet of things"]),
    "FPGA": ("hardware", ["field programmable gate array"]),
    "PCB Design": ("hardware", ["printed circuit board design"]),
    "Altium Designer": ("hardware", ["altium"]),
    "KiCad": ("hardware", []),
    "ARM Architecture": ("hardware", ["arm cortex"]),
    "LTspice": ("hardware", []),
    "Hardware Design": ("hardware", []),
    "Ethernet": ("networking", []),

    # =========================
    # Mechanical and CAD Engineering
    # =========================
    "AutoCAD": ("cad", []),
    "SolidWorks": ("cad", ["solid works"]),
    "Creo": ("cad", ["ptc creo"]),
    "Tekla": ("cad", ["tekla structures"]),
    "Bocad": ("cad", []),
    "CAD": ("cad", ["computer aided design"]),
    "FEA": ("engineering", ["finite element analysis"]),
    "CFD": ("engineering", ["computational fluid dynamics"]),
    "GD&T": ("engineering", ["geometric dimensioning and tolerancing"]),
    "ANSYS": ("engineering", []),
    "Simulation": ("engineering", []),
    "Product Design": ("engineering", []),
    "Solid Modeling": ("engineering", []),

    # =========================
    # Electrical and Automation
    # =========================
    "PLC": ("automation", ["programmable logic controller"]),
    "SCADA": ("automation", []),
    "DCS": ("automation", ["distributed control system"]),
    "Instrumentation": ("automation", []),
    "Power Electronics": ("electrical", []),
    "Electrical Engineering": ("electrical", []),
    "EMI/EMC": ("electrical", ["electromagnetic interference", "electromagnetic compatibility"]),

    # =========================
    # Telecom and Networking
    # =========================
    "Networking": ("networking", ["computer networking"]),
    "LAN": ("networking", ["local area network"]),
    "Fiber Optics": ("telecom", ["optical fiber"]),
    "FTTH": ("telecom", ["fiber to the home"]),
    "FTTx": ("telecom", []),
    "OFC": ("telecom", ["optical fiber cable"]),
    "ISO 8583": ("fintech", ["iso8583"]),

    # =========================
    # IT Support
    # =========================
    "Active Directory": ("it-support", ["microsoft active directory"]),
    "Desktop Support": ("it-support", []),
    "Windows": ("it-support", ["windows os"]),
    "Troubleshooting": ("it-support", []),
    "Printer Support": ("it-support", []),
    "Microsoft Office": ("productivity", ["ms office"]),
    "PowerPoint": ("productivity", ["microsoft powerpoint"]),

    # =========================
    # Enterprise Software
    # =========================
    "SAP": ("enterprise", ["sap erp"]),
    "Oracle SCM": ("enterprise", [
        "oracle cloud scm",
        "oracle fusion scm",
        "oracle supply chain management"
    ]),
    "Oracle HCM": ("enterprise", [
        "oracle cloud hcm",
        "oracle fusion hcm"
    ]),
    "Oracle Inventory": ("enterprise", []),
    "Primavera P6": ("project-management", ["primavera"]),

    # =========================
    # Business and Project Skills
    # =========================
    "Business Analysis": ("business", []),
    "Requirement Gathering": ("business", []),
    "Product Management": ("business", []),
    "Project Management": ("project-management", []),
    "Quantity Surveying": ("engineering", []),
    "Procurement": ("business", []),
}

# Alias normalisation for display
CATEGORY = {name: cat for name, (cat, _) in SKILLS.items()}
SKILL_NAMES = list(SKILLS)
