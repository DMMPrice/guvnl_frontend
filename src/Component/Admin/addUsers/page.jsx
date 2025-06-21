import AddUserPage from "@/Component/Admin/addUsers/page";

<Route
    path="/add-user"
    element={
        <PrivateRoute
            Component={AddUserPage}
            isAuthenticated={isAuthenticated}
        />
    }
/>
