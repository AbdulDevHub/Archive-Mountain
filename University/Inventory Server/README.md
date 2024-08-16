# Assignment 1

## Setup

Ensure the `runme.sh` file is executable:

```bash
chmod +x runme.sh
```

`cd` into the base directory and run the following to download the required dependencies, compile the code and generate the java documentation found in the `docs` directory. Open the html files in a browser to view the documentation, or directly look at the source code in the `src` directory.

```bash
./runme.sh -c
```

## Running

To run the services, run the following:

```bash
./runme.sh -u # for UserService
./runme.sh -p # for ProductService
./runme.sh -i # for ISCS
./runme.sh -o # for OrderService
./runme.sh -w <workloadfile> # for Workload Parser
```

## Important Notes

- API Docs takes precedence over other instructions that are conflicting when implementing the services. Examples:
  - Workload Parser requires all arguments as per the API Docs and will make no assumptions, such as falling back to user id 1 if no user id is provided.
  - Product descriptions are required for all product creation / deletion.
  - Product `name` instead of `productname` field.
- JSON Jar file dependency is located in the `compiled` directory.
- ISCS is implemented in python so it will not have javadocs, check the source code for comments.
- The `runme.sh` script is designed to be run from the base directory of the project.
  - The -w command defaults to the "config.json" file if its not provided in a subsequent argument in case the config file is renamed / moved.
- Caching is implemented in order service for product and user queries. This means that mutations to the user and product services will not be reflected in the order service if the http updates are not forwarded through the order service.
