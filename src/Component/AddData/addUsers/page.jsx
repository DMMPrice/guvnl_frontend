import AddUserPage from "@/Component/AddData/addUsers/page.jsx";

<Route
    path="/add-user"
    element={
        <PrivateRoute
            Component={AddUserPage}
            isAuthenticated={isAuthenticated}
        />
    }
/>
