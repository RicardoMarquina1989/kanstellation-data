
<h2 align="center">
  Welcome to Konstellationdata!
  <img src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" width="28">
</h2>


<p align="center">
  <a href="https://github.com/konstellationdata"><img src="https://readme-typing-svg.herokuapp.com/?lines=We%20have%20200%20Programmers;Data%20observability%20Platform;Established%20in%202024;Always%20learning%20new%20things&center=true&width=380&height=45"></a>
</p>



<a href="https://komarev.com/ghpvc/?username=konstellationddata">
  <img align="right" src="https://komarev.com/ghpvc/?username=konstellationdata&label=Visitors&color=0e75b6&style=flat" alt="Profile visitor" />
</a>


[![wakatime](https://wakatime.com/badge/user/eebb3dd8-d9b2-40de-9b88-6fd6cac99dbc.svg)](https://wakatime.com/@eebb3dd8-d9b2-40de-9b88-6fd6cac99dbc)

<!-- Intro  -->
<h3 align="center">
        <samp>&gt; Hell, I am
                <b><a target="_blank" href="https://konstellationdata.com">KonstellationData</a></b>
        </samp>
</h3>


<p align="center"> 
  <samp>
    <a href="https://www.google.com/search?q=konstellationdata">「 Find me on Google」</a>
    <br>
    「 KonstellationData is a home-grown data observability tool. 」
    <br>
    <br>
  </samp>
</p>

<p align="center">
 <a href="https://konstellationdata.com" target="blank">
  <img src="https://img.shields.io/badge/Website-DC143C?style=for-the-badge&logo=medium&logoColor=white" alt="konstellationdata" />
 </a>
 <a href="https://linkedin.com/in/al-siam" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="konstellationdata"/>
 </a>
 <a href="https://twitter.com/_konstellationdata" target="_blank">
  <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />
 </a>
 <a href="https://instagram.com/_konstellationdata" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-fe4164?style=for-the-badge&logo=instagram&logoColor=white" alt="konstellationdata" />
 </a> 
 <a href="https://facebook.com/konstellationdata.dev" target="_blank">
  <img src="https://img.shields.io/badge/Facebook-20BEFF?&style=for-the-badge&logo=facebook&logoColor=white" alt="konstellationdata"  />
  </a> 
</p>
<br />

<!-- About Section -->
 # About the Project
 
<p>
 <img align="right" width="350" src="/assets/ko-logo-1600.jfif" alt="Coding gif" />
  
 👍 &emsp; Top rated data observability tool. <br/><br/>
 😃 &emsp; The kindest friend who helps when you face a business problem. <br/><br/>
 ❤️ &emsp; Maximize your business capabilities to the fullest.<br/><br/>
 📧 &emsp; Reach anytime: support@konstellationdata.com<br/><br/>
 💬 &emsp; Leave issues [here](https://github.com/konstellationdata/konstellationdata/issues)

</p>

<br/>
<br/>
<br/>

## Built With

![Javascript](https://img.shields.io/badge/Javascript-F0DB4F?style=for-the-badge&labelColor=black&logo=javascript&logoColor=F0DB4F)
![React](https://img.shields.io/badge/-React-61DBFB?style=for-the-badge&labelColor=black&logo=react&logoColor=61DBFB)
![Nodejs](https://img.shields.io/badge/Nodejs-3C873A?style=for-the-badge&labelColor=black&logo=node.js&logoColor=3C873A)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
![VSCode](https://img.shields.io/badge/Visual_Studio-0078d7?style=for-the-badge&logo=visual%20studio&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-0078d7?style=for-the-badge&logo=docker&logoColor=white)

<br/>

<!-- GETTING STARTED -->
# Getting Started
- Node
- Docker (support on Docker Desktop)
- Docker-compose (support on Docker Desktop)

## Prerequisites

After installing programs, you should run follow command. Configure the .env files. Project needs 3 of .env files.
- konstellation/.env
- client/.env
- server/.env

Reference Slack's `konstellation-app-hub` channel. You'll find env files in Canvas (Top-Right button)
![image](https://github.com/konstellationdata/konstellation/assets/143094289/48edb7e3-864c-4be9-adef-789569f11aad)


Before running the project, check docker installed successfully.
```bash
docker --version
docker-compose --version
```

* When you first run or project changed, 

```bash
docker-compose up --build
```

* Next times,

```bash
docker-compose up
```

## Extra commands
### Ubuntu Bash commands
* Node install
```bash
sudo apt update
sudo apt install nodejs
```

* Docker install
```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER
docker --version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

* Start/Stop docker service
```bash
sudo systemctl start docker
sudo systemctl stop docker
```
* nvm install
```bash
sudo apt update
sudo apt install build-essential libssl-dev
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm --version
nvm install --lts
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


# Related products -
[![ko-hub](https://github-readme-stats.vercel.app/api/pin/?username=konstellationdata&repo=ko-hub&border_color=7F3FBF&bg_color=0D1117&title_color=C9D1D9&text_color=8B949E&icon_color=7F3FBF)](https://github.com/konstellationdata/itasks)
[![ko-hub-js](https://github-readme-stats.vercel.app/api/pin/?username=konstellationdata&repo=ko-hub-js&border_color=7F3FBF&bg_color=0D1117&title_color=C9D1D9&text_color=8B949E&icon_color=7F3FBF)](https://github.com/konstellationdata/urfolio)

<p align="left">
  <a href="https://github.com/konstellationdata?tab=repositories" target="_blank"><img alt="All Repositories" title="All Repositories" src="https://img.shields.io/badge/-All%20Repos-2962FF?style=for-the-badge&logo=koding&logoColor=white"/></a>
</p>

<br/>
<hr/>
<br/>
