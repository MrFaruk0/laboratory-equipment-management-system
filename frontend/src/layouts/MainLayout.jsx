import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "270px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          padding: "28px 20px",
        }}
      >
        <Sidebar />
      </aside>

      <main
        style={{
          flex: 1,
          padding: "36px",
          backgroundColor: "#f5f7fb",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;