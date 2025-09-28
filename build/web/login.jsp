<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EMR Login</title>
    <!-- Bootstrap CSS -->
    <link href="${pageContext.request.contextPath}/css/bootstrap.min.css" rel="stylesheet">
    <link href="./style/main.css" rel="stylesheet">

</head>
<body>

<div class="login-container">
    <div class="card login-card">
        <div class="card-body text-center">
            <!-- Logo -->
            <img src="${pageContext.request.contextPath}/images/logo.png" alt="EMR Logo" class="brand-logo image-fluid" style="width: 120px; height: auto;">
            <h3 class="mb-4">EMR</h3>

            <!-- Login Form -->
            <form action="login" method="post">
                <div class="mb-3 text-start">
                    <label for="email" class="form-label">Email</label>
                    <input type="text" class="form-control" id="email" name="email" placeholder="Please enter Username" required>
                </div>
                <div class="mb-3 text-start">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Please enter password" required>
                </div>
                <button type="submit" class="btn btn-success w-100">Login</button>
            </form>
        </div>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="${pageContext.request.contextPath}/js/bootstrap.bundle.min.js"></script>
</body>
</html>
