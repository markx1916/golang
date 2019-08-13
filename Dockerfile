FROM scratch
EXPOSE 8080
ENTRYPOINT ["/golang"]
COPY ./bin/ /