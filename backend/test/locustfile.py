from locust import HttpUser, task, between
from dotenv import load_dotenv
import os


class FastAPIUser(HttpUser):
    wait_time = between(18, 22)

    def on_start(self):
        load_dotenv()  # Load environment variables from .env file
        self.API_KEY = os.getenv("API_KEY")  # Get API_KEY from environment variables

    @task
    def post_data(self):
        code_string = """def calculate_path(self):
        \"""
        Calculate the shortest path from the source to the target point,
        so that the vehicle passes from all "must-nodes"/checkpoints

        Returns:
            path (list):
                Calculated path
        \"""
        final_path = None
        cutoff = 200
        total_paths = list(nx.all_simple_paths(self.G, self.source, self.target, cutoff=cutoff))

        sorted_paths = sorted(total_paths, key=len)

        for path in sorted_paths:
            checked = 0
            for element in self.must_nodes.values():
                if element["pass"]:
                    checked += 1
                    continue
                if any(node in path for node in element["nodes"]):
                    checked += 1

            if checked == len(self.must_nodes):
                final_path = path
                break

        return final_path
    """
        self.client.post(
            "/submit",
            json={"code": code_string, "teamID": "3"},
            headers={
                "Content-Type": "application/json",
                "X-Api-Key": self.API_KEY,  # Send API key in header if required
            },
        )
