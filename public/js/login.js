const submitBtn=document.getElementById('submitBtn');
const emailInput=document.getElementById('email');
const passwordInput=document.getElementById('password');

document.addEventListener('DOMContentLoaded', function() {
    if (window.authManager && authManager.isAuthenticated()) {
        window.location.href = '/dashboard.html';
    }
});

submitBtn.addEventListener('click',async (e)=>{
    e.preventDefault();
    if(!emailInput.value||!passwordInput.value){
        alert('Please fill in all fields');
        return;
    }
    if (passwordInput.value.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    const email=emailInput.value;
    const password=passwordInput.value;
    const response= await fetch('/api/login',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({email,password})
    });
    const responseData = await response.json();
    
    console.log('Login response:', responseData); // Debug log
    console.log('Response status:', response.status); // Debug log
    console.log('AuthManager available:', !!window.authManager); // Debug log
    
    if (response.status === 200) {
        console.log('Login successful, response:', responseData); // Debug log
        
        // Store data immediately
        if (responseData.token) {
            localStorage.setItem('authToken', responseData.token);
        }
        if (responseData.user) {
            localStorage.setItem('user', JSON.stringify(responseData.user));
        }
        
        // Show success message
        alert('Login successful! Redirecting to dashboard...');
        
        
        console.log('Executing redirect now...');
        window.location.replace('/dashboard.html'); // Use replace instead of href
        
    } else {
        console.error('Login failed:', responseData.message); // Debug log
        alert(responseData.message || 'Login failed');
    }
   
})