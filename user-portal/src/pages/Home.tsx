import SearchForm from "../components/SearchForm";

function Home() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div style={{ margin: "1em auto", minWidth: "80%" }}>
      {user && (
        <div>
          <SearchForm />
        </div>
      )}
    </div>
  );
}

export default Home;
