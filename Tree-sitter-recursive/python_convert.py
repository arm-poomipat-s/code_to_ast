import ast

code = """
import aiohttp
import asyncio
import aiofiles
import aiosqlite
from bs4 import BeautifulSoup
from contextlib import asynccontextmanager

# Database Context Manager
@asynccontextmanager
async def db_connection(database):
    conn = await aiosqlite.connect(database)
    try:
        yield conn
    finally:
        await conn.close()

# Decorator to log function calls
def log_decorator(func):
    async def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with {args} and {kwargs}")
        result = await func(*args, **kwargs)
        print(f"Finished {func.__name__} with result {result}")
        return result
    return wrapper

class Scraper:
    def __init__(self, urls):
        self.urls = urls

    @log_decorator
    async def fetch(self, session, url):
        async with session.get(url) as response:
            return await response.text()

    @log_decorator
    async def parse(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        return soup.title.string if soup.title else 'No Title'

    @log_decorator
    async def save(self, db, url, title):
        async with db.execute("INSERT INTO pages (url, title) VALUES (?, ?)", (url, title)):
            await db.commit()

    async def run(self):
        async with aiohttp.ClientSession() as session, db_connection('scraper.db') as db:
            await db.execute("CREATE TABLE IF NOT EXISTS pages (url TEXT, title TEXT)")
            await db.commit()

            tasks = []
            for url in self.urls:
                task = asyncio.create_task(self.scrape(session, db, url))
                tasks.append(task)

            await asyncio.gather(*tasks)

    async def scrape(self, session, db, url):
        html = await self.fetch(session, url)
        title = await self.parse(html)
        await self.save(db, url, title)

# List of URLs to scrape
urls = [
    "https://www.example.com",
    "https://www.python.org",
    "https://www.openai.com"
]

# Run the scraper
scraper = Scraper(urls)
asyncio.run(scraper.run())
"""

# Parse the code into an AST
parsed_ast = ast.parse(code)

# Convert the AST to a formatted string with indentation
ast_str = ast.dump(parsed_ast, indent=4)


with open('result.txt', 'w') as file:
    file.write(ast_str)

print("Formatted AST has been written to result.txt")