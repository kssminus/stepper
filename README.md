# Stepper

## Overview

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
### by Instrument
    $LOAD_PATH.unshift <app_home_path>/lib')
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

excutable에서 **-f** 옵션으로 파일 경로를 줘서 실행
  
    # script/step -s [StepId] -m [Max Step] -f /var/log/step.log
    # script/stepup -s [StepId] -f /var/log/step.log
   
remote_syslog gem으로 sucker에 보내주기

    # remote_syslog -d [host] -p [port] [file_path] 


