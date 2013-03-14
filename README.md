# Stepper

## Overview
![image](https://lh5.googleusercontent.com/-J3648_0C1v0/UUEUUeZopwI/AAAAAAAAAHE/Fk5F7XVEOZw/s1302/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA+2013-03-11+7.11.47+AM.png)
**Stepper**, Transaction Tracker - 여러개의 모듈로 나누어진 시스템에 걸쳐 있는 transaction을 추적해주는 어플, EventMachine + MongoDB + Rails로 개발됨.  
## Requirements
- Ruby 1.9.2 이상
- MongoDB

## Install
    $ git clone https://github.com/kssminus/stepper.git
    $ cd stepper && bundle install 


## Service Start
#### stepper's sucker - udp server
stepper는 [mouth project](https://github.com/cypriss/mouth)의 sucker라는 udp server와 많이 닮아 있습니다.

    # script/stepper -h
    Usage: Stepper [options]
    == Stepper Sucker ==
  
    Starting Stepper's Sucker
    If you don't give any options, it'll refer <AppHome>/config/mongo.yml, sucker.yml
    Stepper의 Sucker를 시작합니다.
    옵션을 주지 않으면<AppHome>/config/mongo.yml, sucker.yml를 참조합니다.
  
    Options:
        --env environment            WHAT ENVIRONMENT ARE YOU ON??
        --pidfile PATH               DO YOU WANT ME TO WRITE A PIDFILE SOMEWHERE FOR U?
        --logfile PATH               I'LL POOP OUT LOGS HERE FOR U
    -v, --verbosity LEVEL            HOW MUCH POOP DO U WANT IN UR LOGS? [LEVEL=0:errors,1:some,2:lots of poop]
    -K, --kill                       SHUT THE Stepper
    -H, --host HOST                  I SUCK ON THIS NETWORK INTERFACE
    -P, --port PORT                  I SUCK FROM THIS HOLE
        --mongodb DATABASE           STORE SUCKINGS IN THIS DB
        --mongohost HOSTPORT         STORE SUCKINGS IN THIS MONGO [eg, localhost or localhost:27017]
    -h, --help                       I WANT MOAR HALP
설정파일에 미리 정의해 놓고 파라미터를 주지 않아도 됩니다.
  
    ### config/mongo.yml ###
    ## 몽고 환경 변수

    development:
      host: localhost
      port: 27017
      database: stepper

    production:
      host: localhost
      port: 27017
      database: stepper
udp 서버설정은 다음 파일에서 합니다.

    ### config/sucker.yml ###
    ## sucker 환경 변수
  
    development:
      host: 127.0.0.1
      port: 8082

    production:
      host: 127.0.0.1
      port: 8082
이제 다음 명령으로 바로 시작 가능합니다.
  
    # script/stepper     

#### WebUI 시작

    # rails server &
    
## Feed DATA(데이터 공급하기)

[stepper-instrument](https://github.com/kssminus/stepper-instrument)
    $ gem install stepper-instrument
    
### by Instrument

    $LOAD_PATH.unshift('<app_home_path>/lib')
    require 'stepper'
    require 'stepper/instrument'
    
    Stepper.daemon_hostport = "8082"
    
    Stepper.step("myCollection.StepId", 3)  # register Step
    Stepper.stepup("myCollection.StepId")     # step up!!
    Stepper.stepup("myCollection.StepId", 2)  # 2 steps up 

### by excutable
config/mongo.yml과 config/sucker.yml이 설정되어 있다면 간단!! 안되어 있다면 **-h**옵션주기
  
    # script/step -s [StepId] -m [Max Step]
    # script/stepup -s [StepId] (-u 3)
  

### by file

excutable에서 **-f** 옵션으로 파일 경로를 줘서 실행하면 해당 파일에 step이 쌓인다.
  
    # script/step -s [StepId] -m [Max Step] -f /var/log/step.log
    # script/stepup -s [StepId] -f /var/log/step.log
   
(remote_syslog)[https://github.com/papertrail/remote_syslog] gem으로 sucker에 보내주기

    # host에 port로 file_path에 있는 파일을 tail하면서 udp로 쏴 주겠다.
    # remote_syslog -d [host] -p [port] [file_path] 
#### 파일 내용
    collection_name.step_id:4|s
    collection_name.step_id:1|su
    collection_name.step_id:3|su
    
# 해야할 일 

- 젬으로 간단하게 설치할 수 있도록.. 
- rails을 unicorn으로 띄울 수 있도록
- UI에서 오래된 스텝을 찾아볼 수 있고 삭제할 수 있도록.. 
- 더 할것 찾아보자
