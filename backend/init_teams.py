from models import Team, Base
from database import engine, SessionLocal


def initialize_teams():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Team).count()
        if existing == 0:
            initial_teams = [
                Team(secret_key="210182"),
                Team(secret_key="012843"),
                Team(secret_key="017411"),
                Team(secret_key="756294"),
                Team(secret_key="102642"),
                Team(secret_key="108573"),
            ]
            db.add_all(initial_teams)
            db.commit()
            print("✅ Initialized 6 teams.")
        else:
            print("ℹ️ Teams already initialized.")
    finally:
        db.close()


if __name__ == "__main__":
    initialize_teams()
