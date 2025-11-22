// This is a Next.js page that fetches data from a Flask backend API and displays it.

// Define an asynchronous function to fetch data from the bigQuery endpoint from the Flask API
async function getBigQuery(){
    const response = await fetch("http://127.0.0.1:5000/api/bq");
    return response.json();
  }

// Define interface for the data rows
interface NameRow {
    name: string;
    gender: string;
  }

// Define the main Home component where data is fetched and displayed on the page
export default async function Home(){
const { data }: { data: NameRow[] } = await getBigQuery();
    return (
    <main className="p-8">
        <h1 className="text-3xl font-bold">Next.js + Flask Starter</h1>
        <div className="mt-4 space-y-2">
        {data.map((row, index) =>(
            <p key={index}>
            {row.name} - {row.gender}
            </p>
        ))}
        </div>
    </main>
    )
}
  