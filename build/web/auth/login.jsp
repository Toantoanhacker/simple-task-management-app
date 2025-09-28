<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EMR Login</title>
    <!-- Bootstrap CSS -->
    <link href="${pageContext.request.contextPath}/assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="./assets/style/main.css" rel="stylesheet">

</head>
<body>

<div class="login-container">
    <div class="card login-card">
        <div class="card-body text-center">
            <!-- Logo -->
            <img src="${pageContext.request.contextPath}/assets/images/logo.png" alt="EMR Logo" class="brand-logo image-fluid" style="width: 120px; height: auto;">
            <h3 class="mb-4">EMR</h3>

            <!-- Login Form -->
            <form action="login" method="post">
                <div class="mb-3 text-start">
                    <label for="email" class="form-label">Email</label>
                    <input type="text" class="form-control" id="email" name="email" placeholder="Example@gmail.com" required>
                </div>
                <div class="mb-3 text-start">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="password" required>
                </div>
                <button type="submit" class="btn btn-success w-100">Login</button>
            </form>
        </div>
            <p class="text-center text-danger">${requestScope.error}</p>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="${pageContext.request.contextPath}/assets/js/bootstrap.bundle.min.js"></script>
</body>
</html>
