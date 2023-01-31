import asyncio
from bleak import BleakScanner
from bleak import BleakClient

address = "0C:7E:8D:F7:58:FD"


async def discover():
    print('Discovering Devices')
    devices = await BleakScanner.discover()
    for d in devices:
        print(d)
        try:
            await connect(d.address)
        except:
            pass
    print('complete')
    while True:
        await asyncio.sleep(10.0)


#address = '0C:7E:8D:F7:58:FD'

def notification_handler(sender, data):
    """Simple notification handler which prints the data received."""
    print('Data is: ', data)

async def connect(address):
    async with BleakClient(address) as client:
        #is_paired = await client.pair()
        #print('Paired: ', is_paired)
        services = await client.get_services()
        for my_service in services.services.values():
            print('Service Description: ', my_service.description)
            for characteristic in my_service.characteristics:
                print('Characteristic: ', characteristic.description, ' UUID: ', characteristic.uuid)
                for prop in characteristic.properties:
                    print('Property: ', prop)
                try:
                    if 'notify' in characteristic.properties or 'indicate' in characteristic.properties:
                        await client.start_notify(characteristic.uuid, notification_handler)
                except Exception as e:
                    print('Exception occured: ', e)
                try:
                    if 'read' in characteristic.properties:
                        data = await client.read_gatt_char(characteristic.uuid)
                        print('Data is: ', data)
                except Exception as e:
                    print('Exception occured: ', e)
        #await client.unpair()
if __name__ == '__main__':
    print(dir(BleakScanner))
    asyncio.run(discover())