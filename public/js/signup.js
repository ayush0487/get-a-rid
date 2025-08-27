const username= document.getElementById('username');
const email= document.getElementById('email');
const password= document.getElementById('password');

const signupBtn= document.getElementById('signupBtn');
signupBtn.addEventListener('click', async ()=>{
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
  

    if (usernameValue === '' || emailValue === '' || passwordValue === '' ) {
        alert('Please fill in all fields');
        return;
    }

    if (passwordValue.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    const response =await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: usernameValue, email: emailValue, password: passwordValue })
    });
    const responseData = await response.json();
    if (response.status === 201 || responseData.success) {
        alert('Signup successful! Welcome to Bla Bla Travel!');
        window.location.href = '/login.html'; 
    } else {
        alert(responseData.message || 'Signup failed');
      
    }
    console.log("after response");
});
 
   

