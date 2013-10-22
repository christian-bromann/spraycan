// removed comments
// original ino script can be found on
// http://playground.arduino.cc/Main/MPU-6050

#include <Wire.h>

#define MPU6050_ACCEL_XOUT_H       0x3B
#define MPU6050_I2C_ADDRESS        0x68
#define MPU6050_WHO_AM_I           0x75
#define MPU6050_PWR_MGMT_1         0x6B
#define MPU6050_PWR_MGMT_2         0x6C

#define SWAP(x,y) swap = x; x = y; y = swap

typedef union accel_t_gyro_union {
    struct {
        uint8_t x_accel_h;
        uint8_t x_accel_l;
        uint8_t y_accel_h;
        uint8_t y_accel_l;
        uint8_t z_accel_h;
        uint8_t z_accel_l;
        uint8_t t_h;
        uint8_t t_l;
        uint8_t x_gyro_h;
        uint8_t x_gyro_l;
        uint8_t y_gyro_h;
        uint8_t y_gyro_l;
        uint8_t z_gyro_h;
        uint8_t z_gyro_l;
    } reg;

    struct {
        int16_t x_accel;
        int16_t y_accel;
        int16_t z_accel;
        int16_t temperature;
        int16_t x_gyro;
        int16_t y_gyro;
        int16_t z_gyro;
    } value;
};

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
    int error;
    uint8_t c;

    #if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
        Wire.begin();
    #elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
        Fastwire::setup(400, true);
    #endif
  
    Serial.begin(9600);
    Serial.println(F("InvenSense MPU-6050"));
    Serial.println(F("June 2012"));

    error = MPU6050_read (MPU6050_WHO_AM_I, &c, 1);
    Serial.print(F("WHO_AM_I : "));
    Serial.print(c,HEX);
    Serial.print(F(", error = "));
    Serial.println(error,DEC);

    error = MPU6050_read (MPU6050_PWR_MGMT_2, &c, 1);
    Serial.print(F("PWR_MGMT_2 : "));
    Serial.print(c,HEX);
    Serial.print(F(", error = "));
    Serial.println(error,DEC);

    MPU6050_write_reg (MPU6050_PWR_MGMT_1, 0);

    pinMode(buttonPin, INPUT);
    pinMode(13, OUTPUT);
}


void loop() {
    int error;
    double dT;
    accel_t_gyro_union accel_t_gyro;

    // if red LED blinks -> Arduino is running
    digitalWrite(13, HIGH);
    delay(50);
    digitalWrite(13, LOW);
    delay(50);

    // get gyroscope values
    error = MPU6050_read (MPU6050_ACCEL_XOUT_H, (uint8_t *) &accel_t_gyro, sizeof(accel_t_gyro));
    uint8_t swap;
    
    SWAP (accel_t_gyro.reg.x_accel_h, accel_t_gyro.reg.x_accel_l);
    SWAP (accel_t_gyro.reg.y_accel_h, accel_t_gyro.reg.y_accel_l);
    SWAP (accel_t_gyro.reg.z_accel_h, accel_t_gyro.reg.z_accel_l);
    SWAP (accel_t_gyro.reg.t_h, accel_t_gyro.reg.t_l);
    SWAP (accel_t_gyro.reg.x_gyro_h, accel_t_gyro.reg.x_gyro_l);
    SWAP (accel_t_gyro.reg.y_gyro_h, accel_t_gyro.reg.y_gyro_l);
    SWAP (accel_t_gyro.reg.z_gyro_h, accel_t_gyro.reg.z_gyro_l);

    Serial.print(F("%1%{\"x\":"));
    Serial.print(accel_t_gyro.value.x_accel, DEC);
    Serial.print(F(",\"y\":"));
    Serial.print(accel_t_gyro.value.y_accel, DEC);
    Serial.print(F(",\"z\":"));
    Serial.print(accel_t_gyro.value.z_accel, DEC);
    Serial.println(F("}1%1"));

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
        Serial.print(F("%2%{\"resistorValue\":"));
        Serial.print(resistor,2);
        Serial.println(F("}2%2"));
        resistorValue = resistor;
    }

    // if can button was clicked send serial message
    if(buttonValue != digitalRead(buttonPin) && buttonValue == 0) {
        // on buttonUp send serial
        Serial.println(F("%3%{\"buttonClick\":true}3%3"));
    }
    buttonValue = digitalRead(buttonPin);

}

int MPU6050_read(int start, uint8_t *buffer, int size) {
    int i, n, error;

    Wire.beginTransmission(MPU6050_I2C_ADDRESS);
    
    n = Wire.write(start);
    if (n != 1) return (-10);

    n = Wire.endTransmission(false);
    if (n != 0) return (n);

    Wire.requestFrom(MPU6050_I2C_ADDRESS, size, true);
    
    i = 0;
    while(Wire.available() && i<size) {
        buffer[i++]=Wire.read();
    }

    if ( i != size) return (-11);
    return (0);
}

int MPU6050_write(int start, const uint8_t *pData, int size) {
    int n, error;

    Wire.beginTransmission(MPU6050_I2C_ADDRESS);
    
    n = Wire.write(start);
    if (n != 1) return (-20);

    n = Wire.write(pData, size);
    if (n != size) return (-21);

    error = Wire.endTransmission(true);
    
    if (error != 0) return (error);
    return (0);
}

int MPU6050_write_reg(int reg, uint8_t data) {
    int error;

    error = MPU6050_write(reg, &data, 1);

    return (error);
}
