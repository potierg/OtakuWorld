var xhr=new XMLHttpRequest();var counter=2;var button=document.getElementById('load_old');if(button!=null)
{button.addEventListener('click',function(){if(counter<=30){xhr.open("POST","/scroll/",true);xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");xhr.onreadystatechange=function(){if(xhr.readyState==4&&(xhr.status==200||xhr.status==0))
{var el=document.createElement("div");el.innerHTML=xhr.responseText;button.parentNode.insertBefore(el,button);counter++;}};xhr.send('increment='+counter);}else{document.getElementById('load_old').outerHTML='';}},false);}
function submitForm(oFormElement)
{var xhr=new XMLHttpRequest();xhr.open(oFormElement.method,oFormElement.action,true);xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');xhr.onreadystatechange=createCallback(xhr,oFormElement.id);xhr.send(new FormData(oFormElement));return false;}
function createCallback(xhr,id){return function(){if(xhr.readyState==4&&xhr.status==200)
{alert(xhr.responseText);document.getElementById(id).reset();}}}