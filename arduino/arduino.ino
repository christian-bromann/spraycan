#include <SoftwareSerial.h>

// removed comments
// original ino script can be found on
// http://playground.arduino.cc/Main/MPU-6050

#include <Wire.h>

float sourceVoltage=5.0;
float voltageR2;
float resistor;
float resistorValue = 0;

int resistorPin = 3;
int buttonPin = 9;

int voltageR1 = 2200.0;
int buttonValue = 1;
long result = 0;

void setup() {  
    Serial.begin(9600);

    pinMode(buttonPin, INPUT);
    pinMode(13, OUTPUT);
}

void loop() {

    // if red LED blinks -> Arduino is running
    digitalWrite(13, HIGH);
    delay(50);
    digitalWrite(13, LOW);
    delay(50);

    // read resistor of cap
    result = 0;
    for(int i=0;i<5;i++){
        result += analogRead(resistorPin);
    }
    result=trunc(result/5);

    voltageR2 = (sourceVoltage/1023.0) * result;
    resistor = voltageR1 * (voltageR2 / (sourceVoltage - voltageR2));

    // only send resistor value if there was a change
    if(resistorValue != resistor) {
        Serial.print(F("%1%{\"resistorValue\":"));
        Serial.print(resistor,2);
        Serial.println(F("}1%1"));
        resistorValue = resistor;
    }

    // if can button was clicked send serial message
    if(buttonValue != digitalRead(buttonPin) && buttonValue == 0) {
        // on buttonUp send serial
        Serial.println(F("%2%{\"buttonClick\":true}2%2"));
    }
    buttonValue = digitalRead(buttonPin);

}
