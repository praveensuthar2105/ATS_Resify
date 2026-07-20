# Deployment & Networking Troubleshooting Guide

This guide addresses two specific errors encountered in the distributed deployment across Oracle VMs and Render.

---

## Issue 1: Connection Refused from Resume Service to Eureka Server
**Symptom:** Logs in the `resume-service` (hosted on Render) show `I/O error on POST request for "http://130.210.40.244:8761/eureka/apps/RESUME-SERVICE": Connect to http://130.210.40.244:8761 failed: Connection refused`.

**Cause:** The Render instance is unable to establish a TCP connection to port `8761` on your Oracle VM (`130.210.40.244`). This is a firewall or network security group issue on the Oracle VM side. The traffic is being actively blocked or the server is only listening on `localhost`.

### Step-by-Step Fix:

**1. Check Oracle Cloud Security Lists (VCN)**
1. Log in to your Oracle Cloud Infrastructure (OCI) Console.
2. Navigate to **Networking** -> **Virtual Cloud Networks**.
3. Click on the VCN associated with VM2.
4. Click on **Security Lists**, then select the default security list for your subnet.
5. Click **Add Ingress Rules**.
6. Set **Source CIDR** to `0.0.0.0/0` (or restrict it to Render's outbound IPs if you know them).
7. Set **Destination Port Range** to `8761`.
8. Save the rule.

**2. Check the OS Firewall on VM2**
Oracle Linux and Ubuntu VMs usually run a host-level firewall (`firewalld` or `iptables`/`ufw`).
1. SSH into VM2 (`130.210.40.244`).
2. If using **Ubuntu (UFW)**, run:
   ```bash
   sudo ufw allow 8761/tcp
   sudo ufw reload
   ```
3. If using **Oracle Linux / CentOS (firewalld)**, run:
   ```bash
   sudo firewall-cmd --zone=public --add-port=8761/tcp --permanent
   sudo firewall-cmd --reload
   ```
4. If you are using raw **iptables**, run:
   ```bash
   sudo iptables -I INPUT -p tcp -m tcp --dport 8761 -j ACCEPT
   sudo service iptables save
   ```

**3. Verify the Discovery Server Binding**
Ensure the Eureka Server isn't accidentally bound only to `localhost`.
1. SSH into VM2.
2. Run `netstat -tulpn | grep 8761` or `ss -tulpn | grep 8761`.
3. You should see it listening on `0.0.0.0:8761` or `:::8761`. If it says `127.0.0.1:8761`, your Java app is binding to loopback only. You can fix this by adding `server.address=0.0.0.0` to the `discovery-server` `application.properties`.

---

## Issue 2: Eureka Peer Replication SocketTimeoutException
**Symptom:** Logs in the `discovery-server` show `jakarta.ws.rs.ProcessingException: java.net.SocketTimeoutException: Read timed out` and warnings about `c.n.e.cluster.ReplicationTaskProcessor`.

**Cause:** By default, Eureka attempts to look for peer nodes to replicate its registry for high availability. In a standalone setup, it defaults to trying to connect to `http://localhost:8761/eureka/`. If the application struggles under load or if there's a routing hiccup on the VM, it times out trying to talk to itself.

### Step-by-Step Fix:

Since you are running a single standalone Eureka server, you should explicitly tell it not to attempt peer replication.

**1. Update Discovery Server Configuration**
In your source code at `Backend/discovery-server/src/main/resources/application.properties`, add the following line:

```properties
eureka.client.serviceUrl.defaultZone=
```
*(Leave it empty after the equals sign).*

You currently have:
```properties
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```
While these stop it from *registering*, setting the `defaultZone` to empty stops it from adding `localhost:8761` as a peer node for replication.

**2. Rebuild and Deploy**
1. Recompile the `discovery-server` jar.
2. Deploy the updated jar to VM2 and restart the service.

---

### Final Verification
1. Restart the `discovery-server` on VM2.
2. Restart the `resume-service` on Render.
3. Check the `resume-service` logs. You should see `DiscoveryClient_RESUME-SERVICE - registration status: 204` without any `Connection refused` errors.
4. Check the `discovery-server` logs. You should see `Registered instance RESUME-SERVICE` and no further `SocketTimeoutException` stack traces.
